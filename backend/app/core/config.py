from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Dungoo SkillsHub API"
    DATABASE_URL: str = "sqlite:///./skillshub.db"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    SECRET_KEY: str = "change-me"
    # Comma-separated list of allowed browser origins.
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
