from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
    app_env: str
    port: int
    data_dir: Path
    wechat_app_id: str
    wechat_app_secret: str
    session_secret: str
    session_ttl_seconds: int
    allow_dev_auth: bool
    storage_backend: str
    sqlite_path: Path


class ConfigError(Exception):
    pass


def load_config() -> Config:
    load_env_file(Path(__file__).resolve().parent.parent / ".env")
    return Config(
        app_env=os.getenv("APP_ENV", "development").lower(),
        port=int(os.getenv("PORT", "3001")),
        data_dir=Path(os.getenv("DATA_DIR", Path(__file__).resolve().parent.parent / "data")).resolve(),
        wechat_app_id=os.getenv("WECHAT_APP_ID", ""),
        wechat_app_secret=os.getenv("WECHAT_APP_SECRET", ""),
        session_secret=os.getenv("SESSION_SECRET", "dev-only-change-me"),
        session_ttl_seconds=int(os.getenv("SESSION_TTL_SECONDS", str(60 * 60 * 24 * 30))),
        allow_dev_auth=os.getenv("ALLOW_DEV_AUTH", "true").lower() in {"1", "true", "yes", "on"},
        storage_backend=os.getenv("STORAGE_BACKEND", "json").lower(),
        sqlite_path=Path(os.getenv("SQLITE_PATH", Path(__file__).resolve().parent.parent / "data" / "xiaocharfood.sqlite3")).resolve(),
    )


def validate_config(config: Config) -> None:
    errors = []

    if config.storage_backend not in {"json", "sqlite"}:
        errors.append(f"Unsupported STORAGE_BACKEND: {config.storage_backend}")

    if not (1 <= config.port <= 65535):
        errors.append("PORT must be between 1 and 65535")

    if config.session_ttl_seconds <= 0:
        errors.append("SESSION_TTL_SECONDS must be positive")

    if config.app_env == "production":
        if config.allow_dev_auth:
            errors.append("ALLOW_DEV_AUTH must be false in production")
        if config.session_secret == "dev-only-change-me" or len(config.session_secret) < 32:
            errors.append("SESSION_SECRET must be a strong production secret")
        if not config.wechat_app_id or not config.wechat_app_secret:
            errors.append("WECHAT_APP_ID and WECHAT_APP_SECRET are required in production")
        if config.storage_backend == "json":
            errors.append("STORAGE_BACKEND=json is not allowed in production")

    if errors:
        raise ConfigError("; ".join(errors))


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
