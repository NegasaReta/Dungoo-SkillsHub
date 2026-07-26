from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

# Neon closes idle connections, so recycle them and check liveness before handing one out.
engine = create_engine(
    settings.sqlalchemy_url,
    connect_args=connect_args,
    pool_pre_ping=not settings.is_sqlite,
    pool_recycle=300 if not settings.is_sqlite else -1,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
