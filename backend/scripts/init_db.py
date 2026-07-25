"""Create the tables defined by the models against DATABASE_URL, then report them.

Usage: python scripts/init_db.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import inspect, text  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.db import models  # noqa: F401,E402  (imported so the tables register on Base)
from app.db.database import Base, engine  # noqa: E402

target = settings.sqlalchemy_url.split("@")[-1]
print(f"Target: {settings.sqlalchemy_url.split('://')[0]}://...@{target}")

Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    if not settings.is_sqlite:
        print("Server:", conn.execute(text("select version()")).scalar())

print("Tables:", sorted(inspect(engine).get_table_names()))
