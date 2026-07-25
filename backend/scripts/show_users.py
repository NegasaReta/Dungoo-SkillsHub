"""Print the users currently stored in DATABASE_URL.

Usage: python scripts/show_users.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import SessionLocal  # noqa: E402
from app.db.models import User  # noqa: E402

with SessionLocal() as db:
    users = db.query(User).order_by(User.id).all()
    print(f"{len(users)} user(s)")
    for user in users:
        print(
            f"  #{user.id} {user.email} completed={user.profile_completed} "
            f"name={user.full_name!r} industries={user.industries} languages={user.languages}"
        )
