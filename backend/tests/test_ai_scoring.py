import json

import pytest

from app.services.ai_scoring import build_prompt, parse_scores


def test_prompt_includes_role_question_and_transcript():
    prompt = build_prompt("data-analyst", "Describe a messy dataset.", "I cleaned it up.")

    assert "data-analyst" in prompt
    assert "Describe a messy dataset." in prompt
    assert "I cleaned it up." in prompt


def test_prompt_keeps_json_shape_instruction_intact():
    prompt = build_prompt("software-engineer", "Q", "A")

    assert '"clarity": number' in prompt
    assert '"improvements": [string]' in prompt


def test_parse_scores_reads_every_dimension():
    raw = json.dumps(
        {
            "clarity": 7,
            "confidence": 6.5,
            "star": 8,
            "summary": "Solid structure.",
            "strengths": ["clear result"],
            "improvements": ["name the metric"],
        }
    )

    result = parse_scores(raw)

    assert result["clarity"] == 7
    assert result["confidence"] == 6.5
    assert result["star"] == 8
    assert result["strengths"] == ["clear result"]


def test_parse_scores_clamps_out_of_range_values():
    raw = json.dumps({"clarity": 42, "confidence": -3, "star": 5})

    result = parse_scores(raw)

    assert result["clarity"] == 10
    assert result["confidence"] == 0


def test_parse_scores_defaults_missing_fields():
    result = parse_scores(json.dumps({"clarity": 5}))

    assert result["star"] == 0
    assert result["summary"] == ""
    assert result["improvements"] == []


def test_parse_scores_rejects_non_json():
    with pytest.raises(json.JSONDecodeError):
        parse_scores("Sure! Here are the scores...")
