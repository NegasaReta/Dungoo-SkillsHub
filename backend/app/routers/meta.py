from fastapi import APIRouter

from app.core.constants import EDUCATION_LEVELS, INDUSTRIES, LANGUAGES
from app.schemas.user import MetaOptions

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/options", response_model=MetaOptions)
def get_options() -> MetaOptions:
    return MetaOptions(
        education_levels=EDUCATION_LEVELS,
        industries=INDUSTRIES,
        languages=LANGUAGES,
    )
