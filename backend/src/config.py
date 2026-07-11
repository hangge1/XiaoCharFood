from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
    port: int
    data_dir: Path
    wechat_app_id: str
    wechat_app_secret: str
    session_secret: str
    session_ttl_seconds: int
    allow_dev_auth: bool
    storage_backend: str
    sqlite_path: Path


def load_config() -> Config:
    return Config(
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
