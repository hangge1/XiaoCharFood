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


def load_config() -> Config:
    return Config(
        port=int(os.getenv("PORT", "3001")),
        data_dir=Path(os.getenv("DATA_DIR", Path(__file__).resolve().parent.parent / "data")).resolve(),
        wechat_app_id=os.getenv("WECHAT_APP_ID", ""),
        wechat_app_secret=os.getenv("WECHAT_APP_SECRET", ""),
    )

