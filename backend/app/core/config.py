import os
from pydantic_settings import BaseSettings, SettingsConfigDict

NEON_PG_URL = "postgresql+asyncpg://neondb_owner:npg_lwc0WFNbvtV6@ep-tiny-recipe-aypngxwk-pooler.c-5.us-east-2.aws.neon.tech/neondb?ssl=require"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pinnacle API"
    SECRET_KEY: str = "super-secret-life-rpg-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", NEON_PG_URL)
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
