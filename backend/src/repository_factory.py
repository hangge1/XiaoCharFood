from __future__ import annotations

from .repository import FileRepository
from .sqlite_repository import SqliteRepository


def create_repository(config):
    if config.storage_backend == "json":
        return FileRepository(config.data_dir)
    if config.storage_backend == "sqlite":
        return SqliteRepository(config.sqlite_path)
    raise ValueError(f"Unsupported storage backend: {config.storage_backend}")

