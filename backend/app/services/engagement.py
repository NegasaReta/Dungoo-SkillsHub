"""
Turns aggregated visual signals into plain observations.

Deliberately not a score. Reading confidence out of eye contact and stillness is
culturally loaded, and the norms these signals encode are not the norms every
candidate is interviewing under — so this describes what the camera saw and lets
the candidate judge it. Clarity, confidence, and STAR come from the transcript
alone and never from anything in this module.

No LLM call: fixed thresholds keep the wording predictable on stage.
"""

# Below this there is too little video to say anything honestly. At the sampling
# rate the tracker uses this is only a few seconds of footage.
MIN_SAMPLES = 40

STEADY_GAZE = 0.6
WANDERING_GAZE = 0.3
STILL_HEAD = 0.7
RESTLESS_HEAD = 0.4
ANIMATED_FACE = 0.5
FLAT_FACE = 0.2


def describe(summary: dict | None) -> list[str]:
    """Return short observations about the candidate's on-camera presence."""
    if not summary:
        return []

    samples = int(summary.get("samples") or 0)
    if samples < MIN_SAMPLES:
        return ["There was not enough video from this session to comment on your presence."]

    notes = [
        _gaze_note(float(summary.get("eye_contact") or 0.0)),
        _head_note(float(summary.get("head_stability") or 0.0)),
        _expression_note(float(summary.get("expression_variety") or 0.0)),
    ]
    return [note for note in notes if note]


def _gaze_note(eye_contact: float) -> str:
    if eye_contact >= STEADY_GAZE:
        return "You faced the camera for most of the session, which reads as engaged."
    if eye_contact <= WANDERING_GAZE:
        return (
            "You were looking away from the camera for most of the session. If that was "
            "notes or a second screen, try glancing at them less often."
        )
    return "You faced the camera about half the time, and looked away for the rest."


def _head_note(head_stability: float) -> str:
    if head_stability >= STILL_HEAD:
        return "You held your head steady while speaking."
    if head_stability <= RESTLESS_HEAD:
        return (
            "Your head moved around a lot while you spoke. Settling into one position "
            "usually makes an answer easier to follow."
        )
    return "Your head moved a moderate amount while you spoke."


def _expression_note(expression_variety: float) -> str:
    if expression_variety >= ANIMATED_FACE:
        return "Your expression changed as you spoke rather than staying fixed."
    if expression_variety <= FLAT_FACE:
        return "Your expression stayed almost unchanged throughout."
    return ""
