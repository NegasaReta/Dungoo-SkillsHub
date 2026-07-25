import io
import wave

import pytest

from app.services import tts


@pytest.fixture(autouse=True)
def both_providers_configured(monkeypatch):
    """Pin the keys so resolution never depends on the developer's own .env."""
    monkeypatch.setattr(tts.settings, "ELEVENLABS_API_KEY", "eleven-key")
    monkeypatch.setattr(tts.settings, "LLM_API_KEY", "google-key")


@pytest.mark.parametrize("configured", ["elevenlabs", "gemini"])
def test_configured_provider_is_used_when_it_has_a_key(configured, monkeypatch):
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", configured)

    assert tts.resolve_provider() == configured


def test_falls_back_to_gemini_when_elevenlabs_has_no_key(monkeypatch):
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", "elevenlabs")
    monkeypatch.setattr(tts.settings, "ELEVENLABS_API_KEY", "")

    assert tts.resolve_provider() == "gemini"


def test_falls_back_to_elevenlabs_when_google_key_is_missing(monkeypatch):
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", "gemini")
    monkeypatch.setattr(tts.settings, "LLM_API_KEY", "")

    assert tts.resolve_provider() == "elevenlabs"


def test_missing_every_key_is_reported_clearly(monkeypatch):
    """The provider name belongs in the log; the router keeps it out of responses."""
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", "gemini")
    monkeypatch.setattr(tts.settings, "ELEVENLABS_API_KEY", "")
    monkeypatch.setattr(tts.settings, "LLM_API_KEY", "")

    with pytest.raises(tts.SpeechError, match="LLM_API_KEY"):
        tts.synthesize("Tell me about yourself.")


def test_a_failing_provider_is_covered_by_the_other_one(monkeypatch):
    """A quota that runs out mid-interview must not silence the interviewer."""
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", "gemini")
    monkeypatch.setattr(
        tts, "_synthesize_gemini", _always_fails("quota exceeded for free tier")
    )
    monkeypatch.setattr(
        tts, "_synthesize_elevenlabs", lambda text: tts.Speech(b"mp3", tts.MP3_MEDIA_TYPE)
    )

    speech = tts.synthesize("Tell me about yourself.")

    assert speech == tts.Speech(b"mp3", tts.MP3_MEDIA_TYPE)


def test_failure_is_raised_once_both_providers_are_exhausted(monkeypatch):
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", "elevenlabs")
    monkeypatch.setattr(tts, "_synthesize_elevenlabs", _always_fails("eleven is down"))
    monkeypatch.setattr(tts, "_synthesize_gemini", _always_fails("gemini is down"))

    with pytest.raises(tts.SpeechError, match="gemini is down"):
        tts.synthesize("Tell me about yourself.")


def test_no_retry_when_the_other_provider_has_no_key(monkeypatch):
    """Without a second key there is nothing to retry, so fail on the first error."""
    monkeypatch.setattr(tts.settings, "TTS_PROVIDER", "elevenlabs")
    monkeypatch.setattr(tts.settings, "LLM_API_KEY", "")
    monkeypatch.setattr(tts, "_synthesize_elevenlabs", _always_fails("eleven is down"))

    with pytest.raises(tts.SpeechError, match="eleven is down"):
        tts.synthesize("Tell me about yourself.")


def _always_fails(message):
    def synthesize(text):
        raise tts.SpeechError(message)

    return synthesize


def test_sample_rate_is_read_from_the_response_header():
    assert tts._sample_rate("audio/L16;codec=pcm;rate=16000") == 16000
    assert tts._sample_rate("audio/L16;codec=pcm") == tts.GEMINI_FALLBACK_RATE


def test_pcm_is_wrapped_as_playable_mono_wav():
    samples = b"\x01\x02" * 100

    wrapped = tts._pcm_to_wav(samples, 24000)

    with wave.open(io.BytesIO(wrapped), "rb") as handle:
        assert handle.getnchannels() == 1
        assert handle.getsampwidth() == 2
        assert handle.getframerate() == 24000
        assert handle.readframes(handle.getnframes()) == samples
