from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.db.migrate import ensure_columns
from app.routers import auth, interview, meta, passport, profile

Base.metadata.create_all(bind=engine)
ensure_columns(engine)

app = FastAPI(title=settings.PROJECT_NAME)

# allow_origins=["*"] is for local dev only — lock down before any real deployment.
# credentials must be False when origins is "*", and JWT auth uses Authorization headers anyway.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(meta.router)
app.include_router(interview.router)
app.include_router(passport.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
