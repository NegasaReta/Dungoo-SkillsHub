"""Call every configured provider once and report which keys actually work.

A key that is present is not a key that works: free tiers expire, quotas run out,
and a wrong key only shows up as a silent interviewer mid-session. This makes that
failure visible before a demo rather than during one.

Speech is checked as a round trip — a sentence is spoken by the TTS provider and
handed straight back to the STT provider — so a pass means the two halves of the
interview agree on an audio format, not just that both returned 200.

    .venv\\Scripts\\python.exe scripts\\provider_check.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings  # noqa: E402
from app.services import llm, transcription, tts  # noqa: E402

SPOKEN_SENTENCE = "Tell me about a time you solved a difficult problem at work."
# Enough overlap to prove the transcript came from the audio, loose enough to
# survive a provider hearing "work" as "the office".
MATCH_THRESHOLD = 0.5

PASS = "PASS"
FAIL = "FAIL"


def report(name: str, outcome: str, detail: str = "") -> bool:
    print(f"  [{outcome}] {name}" + (f" — {detail}" if detail else ""))
    return outcome == PASS


def check_database() -> bool:
    if settings.is_sqlite:
        return report("database", FAIL, "still pointing at sqlite, expected Neon Postgres")

    host = settings.DATABASE_URL.split("@")[-1].split("/")[0]
    return report("database", PASS, f"postgres at {host}")


def check_llm() -> bool:
    try:
        reply = llm.generate_json('Reply with exactly {"ok": true} and nothing else.')
    except llm.LLMError as error:
        return report(f"llm ({settings.LLM_MODEL})", FAIL, str(error)[:200])

    return report(f"llm ({settings.LLM_MODEL})", PASS, f"replied {reply[:40]}")


def check_tts(provider: str) -> bytes | None:
    """Speak one sentence with a named provider; return the audio for the STT check."""
    try:
        spoken = tts._synthesize_with(provider, SPOKEN_SENTENCE)
    except tts.SpeechError as error:
        report(f"tts:{provider}", FAIL, str(error)[:200])
        return None

    report(f"tts:{provider}", PASS, f"{len(spoken.audio):,} bytes of {spoken.media_type}")
    return spoken.audio


def check_stt(provider: str, audio: bytes, media_type: str, language: str) -> bool:
    filename = "answer.mp3" if media_type == tts.MP3_MEDIA_TYPE else "answer.wav"
    label = f"stt:{provider} ({language})"

    transcribe = (
        transcription._transcribe_addis
        if provider == "addis"
        else transcription._transcribe_elevenlabs
    )
    try:
        heard = transcribe(audio, filename, media_type, language)
    except transcription.TranscriptionError as error:
        return report(label, FAIL, str(error)[:200])

    if not heard:
        return report(label, FAIL, "returned an empty transcript")

    spoken_words = set(SPOKEN_SENTENCE.lower().replace(".", "").split())
    heard_words = set(heard.lower().replace(".", "").split())
    overlap = len(spoken_words & heard_words) / len(spoken_words)
    outcome = PASS if overlap >= MATCH_THRESHOLD else FAIL

    return report(label, outcome, f"{overlap:.0%} of words matched — heard {heard!r}")


def main() -> int:
    print(f"Configured: STT={settings.STT_PROVIDER}, TTS={settings.TTS_PROVIDER}\n")

    print("Storage")
    results = [check_database()]

    print("\nText generation")
    results.append(check_llm())

    print("\nSpeech out")
    audio = {provider: check_tts(provider) for provider in ("elevenlabs", "gemini")}
    results.extend(clip is not None for clip in audio.values())

    print("\nSpeech in")
    # Prefer the configured voice's audio, so the pair that will run in a real
    # session is the pair that gets exercised here.
    configured = tts.resolve_provider()
    sample = audio.get(configured) or next((clip for clip in audio.values() if clip), None)
    if sample is None:
        results.append(report("stt", FAIL, "no audio was produced to transcribe"))
    else:
        media_type = tts.WAV_MEDIA_TYPE if configured == "gemini" else tts.MP3_MEDIA_TYPE
        results.append(check_stt("elevenlabs", sample, media_type, "en"))
        results.append(check_stt("addis", sample, media_type, "en"))

    failures = results.count(False)
    print(f"\n{len(results) - failures}/{len(results)} checks passed.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
