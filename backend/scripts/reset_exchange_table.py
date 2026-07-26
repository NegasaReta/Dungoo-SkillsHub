"""Drop and recreate exchange_sessions.

The table was added and then changed shape during the same piece of work, and
`create_all` never alters an existing table. Rather than leave a stale NOT NULL
column that blocks every insert, this drops the table outright and lets the
models rebuild it.

Only safe while peer exchange history is disposable. Delete this script once
anyone's practice is worth keeping — from that point a real migration is needed.

    .venv\\Scripts\\python.exe scripts\\reset_exchange_table.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import inspect, text  # noqa: E402

from app.db.database import Base, engine  # noqa: E402
from app.db.models import ExchangeSession  # noqa: E402


def main() -> int:
    with engine.begin() as connection:
        rows = 0
        if inspect(connection).has_table(ExchangeSession.__tablename__):
            rows = connection.execute(
                text(f"SELECT count(*) FROM {ExchangeSession.__tablename__}")
            ).scalar_one()
            connection.execute(text(f"DROP TABLE {ExchangeSession.__tablename__}"))
            print(f"Dropped {ExchangeSession.__tablename__} ({rows} row(s) discarded).")

    Base.metadata.create_all(bind=engine)

    columns = [column["name"] for column in inspect(engine).get_columns(ExchangeSession.__tablename__)]
    print(f"Recreated with columns: {columns}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
