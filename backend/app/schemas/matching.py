from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field


class MatchingOptions(BaseModel):
    """The values the filters are built from, so the UI has one source for them."""

    languages: list[str]
    levels: list[str]
    industries: list[str]
    daily_limit_seconds: int


class PeerRead(BaseModel):
    """A ranked partner.

    `speaks`/`learning` are what the peer offers and wants in the abstract;
    `teaches`/`learns` are the same thing narrowed to this viewer, which is what
    the card actually shows.
    """

    id: int
    name: str
    title: str
    initials: str
    industry: str
    level: str
    online: bool
    speaks: list[str]
    learning: list[str]
    looking_for: str

    teaches: list[str]
    learns: list[str]
    mutual: bool
    match_percent: int


class Allowance(BaseModel):
    """What is left of today's free 40 minutes."""

    date: date
    daily_limit_seconds: int
    used_seconds: int
    remaining_seconds: int
    exhausted: bool


class SessionStart(BaseModel):
    """Which peer, and the language pair to read the match against.

    `speaks` and `wants` are optional: left out, they are taken from the signed-in
    user's profile, the same default the filters open with.
    """

    peer_id: int
    speaks: list[str] | None = None
    wants: list[str] | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"peer_id": 1, "speaks": ["amharic"], "wants": ["english"]}
        }
    )


class ExchangeSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    peer_id: int
    peer_name: str
    teaches: list[str]
    learns: list[str]
    mutual: bool
    status: str
    started_at: datetime
    ended_at: datetime | None
    # Computed from the server's clock, not stored, so a running session reports
    # the truth without needing a write on every tick.
    seconds: int = Field(0, ge=0)

    @computed_field
    @property
    def languages(self) -> list[str]:
        """Both directions as one list, for anything counting practice by language."""
        return list(dict.fromkeys([*self.teaches, *self.learns]))


class SessionState(BaseModel):
    """Everything the page needs on load: the allowance, and any session still open."""

    allowance: Allowance
    session: ExchangeSessionRead | None = None
