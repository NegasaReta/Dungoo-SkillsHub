"""Audio/video to text conversion for recorded interview answers."""

from pathlib import Path


def transcribe(audio_path: Path) -> str:
    """Return the spoken text from a recorded answer."""
    raise NotImplementedError("Wire up the speech-to-text provider here.")
