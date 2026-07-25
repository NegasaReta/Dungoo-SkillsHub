import httpx
import pytest

from app.services import llm
from app.services.llm import LLMError, extract_text, retry_delay, strip_code_fence


def _reply(parts: list[dict]) -> dict:
    return {"candidates": [{"content": {"parts": parts}}]}


def _rate_limited(retry_after: str | None = "35s", quota_id: str | None = None) -> httpx.Response:
    details = [{"@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": retry_after}]
    if quota_id:
        details.append(
            {
                "@type": "type.googleapis.com/google.rpc.QuotaFailure",
                "violations": [{"quotaId": quota_id}],
            }
        )
    return httpx.Response(
        429,
        json={"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "details": details}},
        request=httpx.Request("POST", "https://example.invalid"),
    )


def test_reply_text_is_returned():
    assert extract_text(_reply([{"text": '{"clarity": 4}'}])) == '{"clarity": 4}'


def test_split_reply_is_joined():
    payload = _reply([{"text": '{"clarity":'}, {"text": " 4}"}])

    assert extract_text(payload) == '{"clarity": 4}'


def test_reasoning_parts_are_left_out_of_the_reply():
    """A thinking model's scratchpad would otherwise corrupt the caller's JSON."""
    payload = _reply(
        [
            {"text": "The answer named a result, so clarity is high.", "thought": True},
            {"text": '{"clarity": 4}'},
        ]
    )

    assert extract_text(payload) == '{"clarity": 4}'


def test_blocked_reply_with_no_candidates_is_an_error():
    with pytest.raises(LLMError):
        extract_text({"promptFeedback": {"blockReason": "SAFETY"}})


def test_empty_reply_is_an_error():
    with pytest.raises(LLMError):
        extract_text(_reply([{"text": "   "}]))


def test_fenced_json_is_unwrapped():
    assert strip_code_fence('```json\n{"clarity": 4}\n```') == '{"clarity": 4}'


def test_fence_without_a_language_tag_is_unwrapped():
    assert strip_code_fence('```\n{"clarity": 4}\n```') == '{"clarity": 4}'


def test_plain_json_is_left_alone():
    assert strip_code_fence('{"clarity": 4}') == '{"clarity": 4}'


# --- rate limits ---------------------------------------------------------------


def test_retry_delay_follows_the_api_and_adds_headroom():
    assert retry_delay(_rate_limited("35s")) == 36.0


def test_retry_delay_falls_back_when_the_api_names_none():
    response = httpx.Response(
        429, json={"error": {}}, request=httpx.Request("POST", "https://example.invalid")
    )

    assert retry_delay(response) == llm.FALLBACK_RETRY_SECONDS + 1.0


def test_retry_delay_is_capped():
    assert retry_delay(_rate_limited("600s")) == llm.MAX_RETRY_SECONDS


@pytest.fixture
def no_waiting(monkeypatch):
    """Run the retry path at full speed."""
    monkeypatch.setattr(llm.time, "sleep", lambda seconds: None)
    monkeypatch.setattr(llm.settings, "LLM_API_KEY", "test-key")


def test_a_rate_limited_call_is_retried_once(no_waiting, monkeypatch):
    """A finished interview scores every answer at once, which trips the free tier."""
    ok = httpx.Response(
        200,
        json=_reply([{"text": '{"clarity": 4}'}]),
        request=httpx.Request("POST", "https://example.invalid"),
    )
    responses = [_rate_limited(), ok]
    monkeypatch.setattr(llm, "_post", lambda prompt, *_: responses.pop(0))

    assert llm.generate_json("score this") == '{"clarity": 4}'
    assert responses == []


def test_a_quota_that_never_clears_is_an_error(no_waiting, monkeypatch):
    monkeypatch.setattr(llm, "_post", lambda prompt, *_: _rate_limited())

    with pytest.raises(LLMError):
        llm.generate_json("score this")


def test_a_spent_daily_quota_is_not_retried(no_waiting, monkeypatch):
    """The free tier's per-day cap clears at midnight, so waiting 35s achieves nothing."""
    calls = []

    def spent(prompt, *_):
        calls.append(prompt)
        return _rate_limited(quota_id="GenerateRequestsPerDayPerProjectPerModel-FreeTier")

    monkeypatch.setattr(llm, "_post", spent)

    with pytest.raises(LLMError, match="daily quota"):
        llm.generate_json("score this")

    assert len(calls) == 1


def test_a_per_minute_limit_is_still_retried(no_waiting, monkeypatch):
    ok = httpx.Response(
        200,
        json=_reply([{"text": '{"clarity": 4}'}]),
        request=httpx.Request("POST", "https://example.invalid"),
    )
    responses = [_rate_limited(quota_id="GenerateRequestsPerMinutePerProject-FreeTier"), ok]
    monkeypatch.setattr(llm, "_post", lambda prompt, *_: responses.pop(0))

    assert llm.generate_json("score this") == '{"clarity": 4}'


def test_a_429_without_quota_details_is_still_retried(no_waiting, monkeypatch):
    ok = httpx.Response(
        200,
        json=_reply([{"text": '{"clarity": 4}'}]),
        request=httpx.Request("POST", "https://example.invalid"),
    )
    responses = [_rate_limited(), ok]
    monkeypatch.setattr(llm, "_post", lambda prompt, *_: responses.pop(0))

    assert llm.generate_json("score this") == '{"clarity": 4}'


def test_no_key_configured_is_an_error(monkeypatch):
    monkeypatch.setattr(llm.settings, "LLM_API_KEY", "")

    with pytest.raises(LLMError):
        llm.generate_json("score this")
