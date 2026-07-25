from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Dungoo SkillsHub API"
    # Accepts a bare Neon/Postgres URL; the psycopg driver is filled in below.
    DATABASE_URL: str = "sqlite:///./dungoo.db"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    # Comma-separated list, or "*" for open local-dev CORS (lock down before deploy).
    CORS_ORIGINS: str = "*"

    @property
    def sqlalchemy_url(self) -> str:
        """SQLAlchemy needs an explicit driver; Neon hands out bare postgres URLs."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
