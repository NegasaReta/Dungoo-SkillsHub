"""Add columns the models declare but the database is missing.

`Base.metadata.create_all` creates missing *tables* and stops there: it never
alters a table that already exists. So a branch that adds a column to an existing
model looks fine on an empty database and fails at runtime on a shared one.

This is a stopgap until Alembic, and only does the safe, additive half of a
migration. It never drops, renames, or retypes a column, so anything beyond
adding one still needs doing by hand. Safe to run repeatedly.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import inspect, text  # noqa: E402

from app.db.database import Base, engine  # noqa: E402
from app.db import models  # noqa: F401,E402  (import registers every model)


def main() -> int:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    dialect = engine.dialect
    added = 0

    with engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                print(f"{table.name}: table missing entirely, create_all will handle it")
                continue

            present = {column["name"] for column in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in present:
                    continue

                column_type = column.type.compile(dialect)
                connection.execute(
                    text(f'ALTER TABLE {table.name} ADD COLUMN "{column.name}" {column_type}')
                )
                print(f"{table.name}: added {column.name} {column_type}")
                added += 1

    print(f"\n{added} column(s) added." if added else "\nSchema already up to date.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
