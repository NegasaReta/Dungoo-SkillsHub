from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Dungoo SkillsHub API"
    # Accepts a bare Neon/Postgres URL; the psycopg driver is filled in below.
    DATABASE_URL: str = "sqlite:///./dungoo.db"
    # Google AI Studio key. It scores answers, picks the next question, and — when
    # TTS_PROVIDER is gemini — speaks them, so one key covers the whole interview.
    LLM_API_KEY: str = ""
    # A lite model on purpose: one interview spends around a dozen text calls, and the
    # free tier of gemini-2.5-flash allows twenty a day for the whole project.
    LLM_MODEL: str = "gemini-flash-lite-latest"
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    # Where the reset link points, i.e. the frontend origin.
    FRONTEND_URL: str = "http://localhost:5173"
    # Local convenience only: returns the reset token in the API response so the
    # flow can be walked without an email provider. Anyone who can call the
    # endpoint could then take over any account, so this must stay false in
    # anything reachable from the internet.
    DEV_EXPOSE_RESET_TOKEN: bool = False

    # --- Interview voice providers -------------------------------------------------
    # These keys stay server-side. Vite inlines any VITE_* variable into the public
    # bundle, so the frontend must reach these providers through this API instead.
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "JBFqnCBsd6RMkjVDRZzb"
    ELEVENLABS_TTS_MODEL: str = "eleven_multilingual_v2"
    ELEVENLABS_STT_MODEL: str = "scribe_v1"
    # Addis AI transcribes Amharic ("am") and Afan Oromo ("om"); ElevenLabs Scribe
    # covers English and 90+ others.
    ADDIS_AI_API_KEY: str = ""
    STT_PROVIDER: str = "elevenlabs"
    # Gemini speaks questions using the same Google key as the LLM, so it is a
    # working voice for anyone who has no ElevenLabs account.
    TTS_PROVIDER: str = "elevenlabs"
    GEMINI_TTS_MODEL: str = "gemini-2.5-flash-preview-tts"
    GEMINI_TTS_VOICE: str = "Kore"
    INTERVIEW_LANGUAGE: str = "en"
    # The interviewer frames each question with a generated sentence before asking
    # the bank text verbatim. Off falls back to the lead-ins written in the bank.
    INTERVIEW_GENERATE_LEAD_INS: bool = True
    # Hard cap so the conversation cannot run unbounded and the demo stays predictable.
    INTERVIEW_MAX_TURNS: int = 5
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
