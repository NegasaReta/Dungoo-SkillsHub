"""Additive schema catch-up for databases created before a column existed.

The project has no migration tool yet, and `create_all` only ever creates missing
tables — it never adds a column to a table that is already there. Without this, a
database created by an earlier build keeps failing every read of the changed table.

Only additive, backwards-compatible columns belong here. Anything that renames,
drops, or backfills data needs a real migration.
"""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

# table -> column -> DDL type with a default that is valid for existing rows.
ADDED_COLUMNS: dict[str, dict[str, str]] = {
    "users": {"practising_languages": "JSON DEFAULT '[]'"},
}


def ensure_columns(engine: Engine) -> list[str]:
    """Add any missing column in ADDED_COLUMNS. Returns what it added."""
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    added: list[str] = []

    for table, columns in ADDED_COLUMNS.items():
        if table not in tables:
            continue

        existing = {column["name"] for column in inspector.get_columns(table)}
        for column, ddl in columns.items():
            if column in existing:
                continue
            with engine.begin() as connection:
                connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
            added.append(f"{table}.{column}")

    return added
