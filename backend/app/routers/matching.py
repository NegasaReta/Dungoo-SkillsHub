from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constants import ANY, EXCHANGE_LANGUAGES, EXCHANGE_LEVELS, INDUSTRIES
from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import ExchangeSession, User
from app.schemas.matching import (
    Allowance,
    ExchangeSessionRead,
    MatchingOptions,
    PeerRead,
    SessionStart,
    SessionState,
)
from app.services import exchange, peer_directory

router = APIRouter(prefix="/matching", tags=["matching"])

ALLOWANCE_SPENT = "Today's free exchange time is used up. It resets at midnight."

# Spelled out rather than imported: Starlette renamed its 422 constant, and the
# name that exists depends on the installed version.
UNPROCESSABLE = 422


def _read(session: ExchangeSession) -> ExchangeSessionRead:
    """Attach the live duration, which is derived rather than stored."""
    return ExchangeSessionRead(
        **ExchangeSessionRead.model_validate(session).model_dump(exclude={"seconds"}),
        seconds=exchange.elapsed_seconds(session),
    )


def _owned(session_id: int, user: User, db: Session) -> ExchangeSession:
    """Someone else's session is reported as missing rather than forbidden."""
    session = db.get(ExchangeSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return session


def _validate(values: list[str], allowed: list[str], field: str) -> list[str]:
    unknown = [value for value in values if value not in allowed]
    if unknown:
        raise HTTPException(UNPROCESSABLE, f"Unsupported {field}: {', '.join(unknown)}")
    return values


@router.get("/options", response_model=MatchingOptions)
def options() -> MatchingOptions:
    """The filter vocabulary. Slugs, so the UI owns the wording and can translate it."""
    return MatchingOptions(
        languages=EXCHANGE_LANGUAGES,
        levels=EXCHANGE_LEVELS,
        industries=peer_directory.industries(),
        daily_limit_seconds=settings.EXCHANGE_DAILY_LIMIT_SECONDS,
    )


@router.get("/peers", response_model=list[PeerRead])
def peers(
    speaks: list[str] = Query(default=[]),
    wants: list[str] = Query(default=[]),
    industry: str = ANY,
    level: str = ANY,
    online_only: bool = False,
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    """Partners for this user, mutual exchanges first.

    Omitting `speaks`/`wants` falls back to the signed-in user's profile
    languages, so the first load of the page needs no filter state at all.
    """
    chosen_speaks = _validate(speaks, EXCHANGE_LANGUAGES, "language") or (
        peer_directory.default_speaks(current_user.languages)
    )
    chosen_wants = _validate(wants, EXCHANGE_LANGUAGES, "language") or (
        peer_directory.default_wants(chosen_speaks)
    )
    _validate([level] if level != ANY else [], EXCHANGE_LEVELS, "level")
    _validate([industry] if industry != ANY else [], INDUSTRIES, "industry")

    return peer_directory.rank(
        speaks=chosen_speaks,
        wants=chosen_wants,
        industry=industry,
        level=level,
        online_only=online_only,
    )


@router.get("/allowance", response_model=Allowance)
def allowance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return exchange.allowance(db, current_user)


@router.get("/state", response_model=SessionState)
def state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionState:
    """Allowance plus any session still open.

    One call so a reload can put the page back exactly as it was, rather than
    stranding a session that is still burning the allowance server-side.
    """
    open_session = exchange.open_session(db, current_user)
    return SessionState(
        allowance=Allowance(**exchange.allowance(db, current_user)),
        session=_read(open_session) if open_session else None,
    )


@router.post(
    "/sessions", response_model=ExchangeSessionRead, status_code=status.HTTP_201_CREATED
)
def start_session(
    payload: SessionStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeSessionRead:
    """Begin practising with a peer.

    What the pair actually trade is recomputed here from the directory. The
    client sends a peer id and its own language filters, never the resulting
    match, so a doctored request cannot write a history entry that never happened.
    """
    peer = peer_directory.get_peer(payload.peer_id)
    if peer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Peer not found")

    speaks = _validate(payload.speaks or [], EXCHANGE_LANGUAGES, "language") or (
        peer_directory.default_speaks(current_user.languages)
    )
    wants = _validate(payload.wants or [], EXCHANGE_LANGUAGES, "language") or (
        peer_directory.default_wants(speaks)
    )

    pair = peer_directory.pairing(peer, speaks, wants)
    if not pair["teaches"] and not pair["learns"]:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "You and this partner have no language in common to practise",
        )

    try:
        session = exchange.start(db, current_user, peer, pair)
    except exchange.AllowanceExhausted:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, ALLOWANCE_SPENT) from None

    return _read(session)


@router.post("/sessions/{session_id}/pause", response_model=ExchangeSessionRead)
def pause_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeSessionRead:
    return _read(exchange.pause(db, _owned(session_id, current_user, db)))


@router.post("/sessions/{session_id}/resume", response_model=ExchangeSessionRead)
def resume_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeSessionRead:
    session = _owned(session_id, current_user, db)
    if session.status == exchange.COMPLETED:
        raise HTTPException(status.HTTP_409_CONFLICT, "This session has already ended")

    try:
        return _read(exchange.resume(db, current_user, session))
    except exchange.AllowanceExhausted:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, ALLOWANCE_SPENT) from None


@router.post("/sessions/{session_id}/end", response_model=ExchangeSessionRead)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeSessionRead:
    return _read(exchange.end(db, current_user, _owned(session_id, current_user, db)))


@router.get("/sessions", response_model=list[ExchangeSessionRead])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ExchangeSessionRead]:
    """Completed practice, oldest first, for the progress screens."""
    return [_read(session) for session in exchange.history(db, current_user)]
