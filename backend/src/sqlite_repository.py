from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator

from .repository import ARRAY_COLLECTIONS, SINGLETON_COLLECTIONS, create_id, empty_user_data, now_string


@dataclass
class SqliteRepository:
    db_path: Path

    def __post_init__(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS records (
                  user_id TEXT NOT NULL,
                  collection TEXT NOT NULL,
                  id TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  updated_at TEXT NOT NULL,
                  PRIMARY KEY (user_id, collection, id)
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS singletons (
                  user_id TEXT NOT NULL,
                  collection TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  updated_at TEXT NOT NULL,
                  PRIMARY KEY (user_id, collection)
                )
                """
            )

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def list(self, user_id: str, collection: str) -> list[dict[str, Any]]:
        self._assert_array_collection(collection)
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT payload
                FROM records
                WHERE user_id = ? AND collection = ?
                ORDER BY updated_at DESC, id DESC
                """,
                (user_id, collection),
            ).fetchall()
        return [json.loads(row["payload"]) for row in rows]

    def get(self, user_id: str, collection: str, record_id: str) -> dict[str, Any] | None:
        self._assert_array_collection(collection)
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT payload
                FROM records
                WHERE user_id = ? AND collection = ? AND id = ?
                """,
                (user_id, collection, record_id),
            ).fetchone()
        return json.loads(row["payload"]) if row else None

    def upsert(self, user_id: str, collection: str, payload: dict[str, Any]) -> dict[str, Any]:
        self._assert_array_collection(collection)
        current_time = now_string()
        record = {
            **payload,
            "id": payload.get("id") or create_id(collection),
            "createdAt": payload.get("createdAt") or current_time,
            "updatedAt": current_time,
        }
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO records (user_id, collection, id, payload, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id, collection, id)
                DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
                """,
                (user_id, collection, record["id"], json.dumps(record, ensure_ascii=False), record["updatedAt"]),
            )
        return record

    def remove(self, user_id: str, collection: str, record_id: str) -> bool:
        self._assert_array_collection(collection)
        with self._connect() as connection:
            cursor = connection.execute(
                """
                DELETE FROM records
                WHERE user_id = ? AND collection = ? AND id = ?
                """,
                (user_id, collection, record_id),
            )
        return cursor.rowcount > 0

    def get_singleton(self, user_id: str, collection: str) -> dict[str, Any]:
        self._assert_singleton_collection(collection)
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT payload
                FROM singletons
                WHERE user_id = ? AND collection = ?
                """,
                (user_id, collection),
            ).fetchone()
        return json.loads(row["payload"]) if row else {}

    def set_singleton(self, user_id: str, collection: str, payload: dict[str, Any]) -> dict[str, Any]:
        self._assert_singleton_collection(collection)
        current = self.get_singleton(user_id, collection)
        next_value = {**current, **payload, "updatedAt": now_string()}
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO singletons (user_id, collection, payload, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(user_id, collection)
                DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
                """,
                (user_id, collection, json.dumps(next_value, ensure_ascii=False), next_value["updatedAt"]),
            )
        return next_value

    def export_user(self, user_id: str) -> dict[str, Any]:
        data = empty_user_data()
        for collection in ARRAY_COLLECTIONS:
            data[collection] = self.list(user_id, collection)
        for collection in SINGLETON_COLLECTIONS:
            data[collection] = self.get_singleton(user_id, collection)
        return data

    def import_user(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        next_data = empty_user_data()
        for collection in ARRAY_COLLECTIONS:
            value = payload.get(collection)
            next_data[collection] = value if isinstance(value, list) else []
        for collection in SINGLETON_COLLECTIONS:
            value = payload.get(collection)
            next_data[collection] = value if isinstance(value, dict) else {}

        with self._connect() as connection:
            connection.execute("DELETE FROM records WHERE user_id = ?", (user_id,))
            connection.execute("DELETE FROM singletons WHERE user_id = ?", (user_id,))
            for collection in ARRAY_COLLECTIONS:
                for record in next_data[collection]:
                    if not isinstance(record, dict) or not record.get("id"):
                        continue
                    updated_at = record.get("updatedAt") or record.get("deletedAt") or now_string()
                    connection.execute(
                        """
                        INSERT INTO records (user_id, collection, id, payload, updated_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (user_id, collection, record["id"], json.dumps(record, ensure_ascii=False), updated_at),
                    )
            for collection in SINGLETON_COLLECTIONS:
                connection.execute(
                    """
                    INSERT INTO singletons (user_id, collection, payload, updated_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        collection,
                        json.dumps(next_data[collection], ensure_ascii=False),
                        next_data[collection].get("updatedAt") or now_string(),
                    ),
                )
        return next_data

    @staticmethod
    def _assert_array_collection(collection: str) -> None:
        if collection not in ARRAY_COLLECTIONS:
            raise ValueError(f"Unknown array collection: {collection}")

    @staticmethod
    def _assert_singleton_collection(collection: str) -> None:
        if collection not in SINGLETON_COLLECTIONS:
            raise ValueError(f"Unknown singleton collection: {collection}")
