import pytest

from app.services import transcription


@pytest.fixture(autouse=True)
def both_providers_configured(monkeypatch):
    """Pin the keys so resolution never depends on the developer's own .env."""
    monkeypatch.setattr(transcription.settings, "ELEVENLABS_API_KEY", "eleven-key")
    monkeypatch.setattr(transcription.settings, "ADDIS_AI_API_KEY", "addis-key")


@pytest.mark.parametrize(
    ("language", "expected"),
    [("en", "elevenlabs"), ("fr", "elevenlabs"), ("am", "addis"), ("om", "addis")],
)
def test_provider_is_chosen_by_language(language, expected, monkeypatch):
    monkeypatch.setattr(transcription.settings, "STT_PROVIDER", "elevenlabs")

    assert transcription.resolve_provider(language) == expected


def test_addis_can_be_forced_for_every_language(monkeypatch):
    monkeypatch.setattr(transcription.settings, "STT_PROVIDER", "addis")

    assert transcription.resolve_provider("en") == "addis"


def test_falls_back_to_addis_when_elevenlabs_has_no_key(monkeypatch):
    monkeypatch.setattr(transcription.settings, "STT_PROVIDER", "elevenlabs")
    monkeypatch.setattr(transcription.settings, "ELEVENLABS_API_KEY", "")

    assert transcription.resolve_provider("en") == "addis"


def test_falls_back_to_elevenlabs_when_addis_has_no_key(monkeypatch):
    monkeypatch.setattr(transcription.settings, "ADDIS_AI_API_KEY", "")

    assert transcription.resolve_provider("am") == "elevenlabs"


def test_missing_elevenlabs_key_is_reported_clearly(monkeypatch):
    """The provider name belongs in the log; the router keeps it out of responses."""
    monkeypatch.setattr(transcription.settings, "STT_PROVIDER", "elevenlabs")
    monkeypatch.setattr(transcription.settings, "ELEVENLABS_API_KEY", "")
    monkeypatch.setattr(transcription.settings, "ADDIS_AI_API_KEY", "")

    with pytest.raises(transcription.TranscriptionError, match="ELEVENLABS_API_KEY"):
        transcription.transcribe(b"audio", "answer.webm", "audio/webm", language="en")


def test_missing_addis_key_is_reported_clearly(monkeypatch):
    monkeypatch.setattr(transcription.settings, "STT_PROVIDER", "addis")
    monkeypatch.setattr(transcription.settings, "ELEVENLABS_API_KEY", "")
    monkeypatch.setattr(transcription.settings, "ADDIS_AI_API_KEY", "")

    with pytest.raises(transcription.TranscriptionError, match="ADDIS_AI_API_KEY"):
        transcription.transcribe(b"audio", "answer.webm", "audio/webm", language="am")
