"""Aggregation of per-answer feedback into a single skill passport."""

from collections.abc import Sequence

from app.db.models import FeedbackReport

SKILL_DIMENSIONS = {
    "clarity": "clarity_score",
    "confidence": "confidence_score",
    "star": "star_score",
}


def aggregate_scores(reports: Sequence[FeedbackReport]) -> dict[str, float]:
    """Average each rubric dimension across every scored answer."""
    if not reports:
        return {skill: 0.0 for skill in SKILL_DIMENSIONS}

    return {
        skill: round(sum(getattr(report, attr) for report in reports) / len(reports), 2)
        for skill, attr in SKILL_DIMENSIONS.items()
    }
