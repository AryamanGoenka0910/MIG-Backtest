from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str  # required — set in .env, e.g. postgresql://user:pass@host:5432/dbname
    UPLOAD_DIR: Path = Path("uploads")
    LOGS_DIR: Path = Path("logs")
    DATA_PATH: Path = Path("public_test_data.csv")
    SANDBOX_IMAGE: str = "mig-sandbox:latest"
    SUBMISSION_TIMEOUT_SECONDS: int = 60
    MAX_FILE_SIZE_BYTES: int = 1_048_576   # 1 MB  — single .py upload
    MAX_ZIP_SIZE_BYTES: int = 52_428_800  # 50 MB — zip upload (strategy + weights)
    WORKER_POLL_INTERVAL_SECONDS: int = 5
    MAX_DAILY_SUBMISSIONS: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
