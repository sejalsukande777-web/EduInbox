from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EduInbox AI"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    DEBUG: bool = False
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/eduinbox"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # JWT
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Encryption key for OAuth tokens
    ENCRYPTION_KEY: str = ""

    # Storage
    STORAGE_TYPE: str = "local"  # "local" | "s3" | "r2"
    STORAGE_LOCAL_PATH: str = "./uploads"
    STORAGE_BUCKET: str = ""
    STORAGE_KEY_ID: str = ""
    STORAGE_SECRET: str = ""
    STORAGE_ENDPOINT: str = ""

    # AI
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Gmail
    GMAIL_SCOPES: List[str] = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
]
    GMAIL_MAX_RESULTS: int = 100
    GMAIL_DISCOVERY_LOOKBACK_DAYS: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()