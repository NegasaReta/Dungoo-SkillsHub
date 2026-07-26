"""The 40-minute daily allowance, and the clock that spends it (SRS 2.5).

Everything here exists because the free tier is a limit, and a limit a client
reports on itself is not a limit. The browser used to hold this in localStorage,
where clearing one key bought an unlimited day. So the rule is: the client says
when a session starts, pauses, resumes, and ends, and the server decides how long
that took and whether there was any allowance left to spend.

The day rolls over at midnight in Ethiopia rather than UTC, so an evening session
is not cut short by a reset at 3am local. Ethiopia has never observed daylight
saving, so a fixed +03:00 is exact and needs no timezone database.
"""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import ExchangeSession, User

ETHIOPIA = timezone(timedelta(hours=3))

ACTIVE = "active"
PAUSED = "paused"
COMPLETED = "completed"
OPEN_STATUSES = (ACTIVE, PAUSED)

# Anything shorter is a misclick rather than practice, and is dropped instead of
# cluttering the history with two-second entries.
MIN_RECORDED_SECONDS = 20


def now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(moment: datetime | None) -> datetime | None:
    """Postgres hands back aware datetimes and SQLite naive ones; normalise to UTC."""
    if moment is None:
        return None
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def local_day(moment: datetime) -> date:
    return moment.astimezone(ETHIOPIA).date()


def _day_bounds(moment: datetime) -> tuple[datetime, datetime]:
    """The UTC instants that bracket the Ethiopian day `moment` falls in."""
    start_local = datetime.combine(local_day(moment), datetime.min.time(), tzinfo=ETHIOPIA)
    return start_local.astimezone(timezone.utc), (start_local + timedelta(days=1)).astimezone(
        timezone.utc
    )


def elapsed_seconds(session: ExchangeSession, at: datetime | None = None) -> int:
    """How long this session has actually run, banked stretches plus the live one."""
    at = at or now()
    running = _aware(session.resumed_at)
    live = int((at - running).total_seconds()) if running else 0
    return max(0, session.accumulated_seconds + live)


def _sessions_today(db: Session, user: User, at: datetime) -> list[ExchangeSession]:
    start, end = _day_bounds(at)
    return list(
        db.scalars(
            select(ExchangeSession)
            .where(ExchangeSession.user_id == user.id)
            .where(ExchangeSession.started_at >= start)
            .where(ExchangeSession.started_at < end)
        )
    )


def used_seconds(db: Session, user: User, at: datetime | None = None) -> int:
    """Seconds spent today, including a session that is still running.

    Capped at the limit so an abandoned tab cannot report a negative remainder,
    and so the number shown always means "of your 40 minutes".
    """
    at = at or now()
    spent = sum(elapsed_seconds(session, at) for session in _sessions_today(db, user, at))
    return min(spent, settings.EXCHANGE_DAILY_LIMIT_SECONDS)


def allowance(db: Session, user: User, at: datetime | None = None) -> dict:
    at = at or now()
    used = used_seconds(db, user, at)
    limit = settings.EXCHANGE_DAILY_LIMIT_SECONDS

    return {
        "date": local_day(at),
        "daily_limit_seconds": limit,
        "used_seconds": used,
        "remaining_seconds": max(0, limit - used),
        "exhausted": used >= limit,
    }


def open_session(db: Session, user: User) -> ExchangeSession | None:
    """The user's one unfinished session, if any."""
    return db.scalars(
        select(ExchangeSession)
        .where(ExchangeSession.user_id == user.id)
        .where(ExchangeSession.status.in_(OPEN_STATUSES))
        .order_by(ExchangeSession.started_at.desc())
    ).first()


class AllowanceExhausted(RuntimeError):
    """No free time left today."""


def start(
    db: Session,
    user: User,
    peer: dict,
    pair: dict,
    at: datetime | None = None,
) -> ExchangeSession:
    """Open a session against the remaining allowance.

    Any session the user left open is closed first. Two clocks running at once
    would spend the allowance twice as fast as the wall clock, which is both
    wrong and the obvious way to cheat a per-day limit.
    """
    at = at or now()

    if allowance(db, user, at)["exhausted"]:
        raise AllowanceExhausted

    stale = open_session(db, user)
    if stale is not None:
        end(db, user, stale, at)

    session = ExchangeSession(
        user_id=user.id,
        peer_id=peer["id"],
        peer_name=peer["name"],
        teaches=pair["teaches"],
        learns=pair["learns"],
        mutual=pair["mutual"],
        status=ACTIVE,
        accumulated_seconds=0,
        started_at=at,
        resumed_at=at,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def _bank(session: ExchangeSession, at: datetime) -> None:
    """Move the live stretch into the running total and stop the clock."""
    session.accumulated_seconds = elapsed_seconds(session, at)
    session.resumed_at = None


def pause(db: Session, session: ExchangeSession, at: datetime | None = None) -> ExchangeSession:
    if session.status != ACTIVE:
        return session

    _bank(session, at or now())
    session.status = PAUSED
    db.commit()
    db.refresh(session)
    return session


def resume(
    db: Session, user: User, session: ExchangeSession, at: datetime | None = None
) -> ExchangeSession:
    """Restart the clock, if there is still allowance to spend."""
    at = at or now()
    if session.status != PAUSED:
        return session
    if allowance(db, user, at)["exhausted"]:
        raise AllowanceExhausted

    session.resumed_at = at
    session.status = ACTIVE
    db.commit()
    db.refresh(session)
    return session


def end(
    db: Session, user: User, session: ExchangeSession, at: datetime | None = None
) -> ExchangeSession:
    """Close the session for good. Idempotent, so a double click is harmless."""
    at = at or now()
    if session.status == COMPLETED:
        return session

    _bank(session, at)
    session.status = COMPLETED
    session.ended_at = at
    db.commit()
    db.refresh(session)
    return session


def history(db: Session, user: User) -> list[ExchangeSession]:
    """Completed sessions worth counting as practice, oldest first.

    Analytics reads this alongside interview answers, so the misclicks are left
    out rather than padding the count with sessions nobody sat.
    """
    return list(
        db.scalars(
            select(ExchangeSession)
            .where(ExchangeSession.user_id == user.id)
            .where(ExchangeSession.status == COMPLETED)
            .where(ExchangeSession.accumulated_seconds >= MIN_RECORDED_SECONDS)
            .order_by(ExchangeSession.started_at)
        )
    )
