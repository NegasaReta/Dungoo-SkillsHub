import json

import pytest

from app.services.practice_coach import SYSTEM_PROMPT, build_contents, parse_reply


def test_system_prompt_pins_the_json_shape():
    assert '"corrected_text": string' in SYSTEM_PROMPT
    assert '"explanation": string' in SYSTEM_PROMPT
    assert "no markdown fences" in SYSTEM_PROMPT


def test_build_contents_puts_the_new_message_last():
    contents = build_contents("How do I sound?", [{"role": "user", "content": "Hello"}])

    assert len(contents) == 2
    assert contents[-1].role == "user"
    assert contents[-1].parts[0].text == "How do I sound?"


def test_build_contents_maps_assistant_turns_to_model():
    contents = build_contents("Next", [{"role": "assistant", "content": "Earlier reply"}])

    assert contents[0].role == "model"
    assert contents[0].parts[0].text == "Earlier reply"


def test_parse_reply_reads_every_field():
    raw = json.dumps(
        {
            "corrected_text": "I went to the meeting yesterday.",
            "errors": [
                {
                    "original": "have went",
                    "fix": "went",
                    "explanation": "Simple past does not take 'have'.",
                }
            ],
            "follow_up": "What was decided in the meeting?",
        }
    )

    result = parse_reply(raw)

    assert result["corrected_text"] == "I went to the meeting yesterday."
    assert result["errors"][0]["fix"] == "went"
    assert result["follow_up"] == "What was decided in the meeting?"


def test_parse_reply_accepts_an_empty_error_list():
    raw = json.dumps({"corrected_text": "Perfect.", "errors": [], "follow_up": "What next?"})

    assert parse_reply(raw)["errors"] == []


def test_parse_reply_tolerates_markdown_fences():
    raw = '```json\n{"corrected_text": "Fine.", "errors": [], "follow_up": "And then?"}\n```'

    assert parse_reply(raw)["corrected_text"] == "Fine."


def test_parse_reply_fills_missing_error_keys():
    raw = json.dumps(
        {"corrected_text": "Fine.", "errors": [{"original": "a"}], "follow_up": "Why?"}
    )

    assert parse_reply(raw)["errors"][0] == {"original": "a", "fix": "", "explanation": ""}


def test_parse_reply_rejects_non_json():
    with pytest.raises(ValueError):
        parse_reply("Sure! Here is your correction...")


def test_parse_reply_rejects_a_missing_corrected_text():
    with pytest.raises(ValueError):
        parse_reply(json.dumps({"errors": [], "follow_up": "What next?"}))


def test_parse_reply_rejects_an_empty_reply():
    with pytest.raises(ValueError):
        parse_reply("")
