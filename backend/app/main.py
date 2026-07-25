from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.routers import interview, passport, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(interview.router)
app.include_router(passport.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
