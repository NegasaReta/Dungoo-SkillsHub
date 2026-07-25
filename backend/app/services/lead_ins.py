"""The sentence the interviewer says just before each question.

The question itself is never written by a model — the bank text is asked word for
word straight afterwards (AGENTS.md). Only the framing around it is generated, and
all of it in one batched call when the session is created, so no turn ever waits on
the model and a bad reply is caught before the interview starts rather than on stage.

Every generated line has to clear `is_usable` first. The rule that matters most is
the ban on rubric vocabulary: a lead-in that tells the candidate to give a result or
to structure their answer turns the STAR score into a test of whether they followed
instructions, and the passport stops measuring what it claims to measure.
"""

import json
import logging
import re

from app.core.config import settings
from app.db.models import User
from app.services import llm, question_bank

# Tight on purpose. Given room the model writes essay English; a spoken aside is short.
MAX_WORDS = 16
# Short cap of its own: this call sits between "Join now" and the room opening.
GENERATION_TIMEOUT = 15.0
# Warm, unlike scoring. At 0 the model simply copies the house style back, and every
# candidate in a role would hear word for word the same interviewer.
GENERATION_TEMPERATURE = 0.9

PROMPT = """You are the interviewer in a practice job interview for a {role_label}.
Candidate background: {candidate}.

For each question below, write the single sentence you would say immediately before
asking it — the framing that explains why you are raising the topic. The question is
then asked word for word, so your sentence must not ask anything or answer it for them.

Rules for every sentence:
- One sentence, at most {max_words} words, and no question mark.
- Speak it, do not write it: everyday words, short, the way a person talks.
- Say something true about this kind of work, not about the candidate.
- You are interviewing alone, so never say "we" or "us".
- Do not repeat or paraphrase the question.
- Never tell the candidate how to answer, what to include, or how to structure it.
- Easy to follow for someone who speaks English as a second language.

Asking a nurse "Tell me about a shift that went badly" it could be "Ward work turns
on its head without any warning." That is the register: plain, spoken, about the job.

Questions:
{questions}

Reply with JSON only: {{"lead_ins": {{"<id>": "<sentence>", ...}}}}
"""

# Words that coach the shape of an answer instead of setting up the question.
COACHING_TERMS = re.compile(
    r"\b(star|situation|task|action|result|outcome|metric|number|quantify"
    r"|example|specific|concrete|structure|clarity|confidence|concise)s?\b",
    re.IGNORECASE,
)
# Short words carry no signal when checking whether a line just restates the question.
CONTENT_WORD_LENGTH = 5
MAX_QUESTION_OVERLAP = 0.5

logger = logging.getLogger(__name__)


def authored(role: str) -> dict[str, str]:
    """The lead-in written into the bank for every question in a role."""
    return {item["id"]: item.get("lead_in", "") for item in question_bank.pool(role)}


def for_session(role: str, user: User | None = None) -> dict[str, str]:
    """Lead-in text for every question of a role, keyed by question id.

    Never raises and never leaves a gap: a refusal, an unusable line, or a missing
    id all fall back to the authored bank text, which is always speakable.
    """
    fallbacks = authored(role)
    if not settings.INTERVIEW_GENERATE_LEAD_INS or not settings.LLM_API_KEY:
        return fallbacks

    try:
        generated = _generate(role, user)
    except (llm.LLMError, ValueError, TypeError, AttributeError) as error:
        logger.warning("Lead-in generation failed; using the authored bank text: %s", error)
        return fallbacks

    # Starting from the authored text means an id the model never mentions, or is not
    # allowed to write, keeps its line without a special case.
    lines = dict(fallbacks)
    for item in questions_to_frame(role):
        lines[item["id"]] = _choose(generated.get(item["id"]), item["text"], lines[item["id"]])
    return lines


def _choose(candidate: str | None, question: str, fallback: str) -> str:
    if candidate and is_usable(candidate, question):
        return candidate.strip()
    if candidate:
        logger.info("Rejected a generated lead-in: %r", candidate)
    return fallback


def is_usable(text: str, question: str) -> bool:
    """Whether a generated line can be spoken as it is."""
    line = (text or "").strip()
    if not line:
        return False
    if "?" in line:
        return False
    if len(line.split()) > MAX_WORDS:
        return False
    if COACHING_TERMS.search(line):
        return False
    return not restates(line, question)


def restates(text: str, question: str) -> bool:
    """True when the line is mostly the question said again."""
    words = _content_words(text)
    if not words:
        return False
    return len(words & _content_words(question)) / len(words) > MAX_QUESTION_OVERLAP


def _content_words(text: str) -> set[str]:
    return {
        word for word in re.findall(r"[a-z]+", text.lower()) if len(word) >= CONTENT_WORD_LENGTH
    }


def questions_to_frame(role: str) -> list[dict]:
    """Everything the model writes framing for: the pool bar the greeting.

    The opening keeps its authored line, and falls back to it like any missing id.
    It is the first thing the candidate hears, and asked for framing a model writes
    a maxim about the profession where a hello belongs.
    """
    opening_id = question_bank.opening(role)["id"]
    return [item for item in question_bank.pool(role) if item["id"] != opening_id]


def build_prompt(role: str, user: User | None = None) -> str:
    """The one batched request for a whole role.

    The authored lead-ins are deliberately kept out of it. Shown its own fallback,
    even a warm model hands it straight back, and the call buys nothing.
    """
    questions = "\n".join(
        f"- id: {item['id']} | competency: {item['competency']} | asked: {item['text']}"
        for item in questions_to_frame(role)
    )
    return PROMPT.format(
        role_label=question_bank.label(role),
        candidate=_candidate_line(user),
        max_words=MAX_WORDS,
        questions=questions,
    )


def _candidate_line(user: User | None) -> str:
    """Only what shapes the framing. No name or contact detail leaves the server."""
    details = []
    if user and user.industries:
        details.append(f"aiming at work in {', '.join(user.industries)}")
    if user and user.education_level:
        details.append(f"education level {user.education_level}")
    return "; ".join(details) or "no profile details given"


def _generate(role: str, user: User | None) -> dict[str, str]:
    reply = llm.generate_json(
        build_prompt(role, user),
        timeout=GENERATION_TIMEOUT,
        temperature=GENERATION_TEMPERATURE,
    )
    payload = json.loads(reply)
    return {str(key): str(value) for key, value in (payload.get("lead_ins") or {}).items()}
