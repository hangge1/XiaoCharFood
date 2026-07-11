from __future__ import annotations

import json
import re
import secrets
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


ARRAY_COLLECTIONS = {"meals", "plans", "restaurants", "restaurantVisits"}
SINGLETON_COLLECTIONS = {"preferences", "profile"}


def empty_user_data() -> dict[str, Any]:
    return {
        "meals": [],
        "plans": [],
        "restaurants": [],
        "restaurantVisits": [],
        "preferences": {},
        "profile": {},
    }


def now_string() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def create_id(prefix: str) -> str:
    stamp = int(datetime.now().timestamp() * 1000)
    return f"{prefix}_{stamp}_{secrets.token_hex(3)}"


def safe_user_id(user_id: str | None) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", user_id or "anonymous")


@dataclass
class FileRepository:
    data_dir: Path

    def __post_init__(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, user_id: str) -> Path:
        return self.data_dir / f"{safe_user_id(user_id)}.json"

    def read_user(self, user_id: str) -> dict[str, Any]:
        target = self._path(user_id)
        if not target.exists():
            return empty_user_data()

        raw = target.read_text(encoding="utf-8")
        if not raw.strip():
            return empty_user_data()

        data = empty_user_data()
        data.update(json.loads(raw))
        return data

    def write_user(self, user_id: str, data: dict[str, Any]) -> None:
        target = self._path(user_id)
        target.parent.mkdir(parents=True, exist_ok=True)
        merged = empty_user_data()
        merged.update(data)
        target.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def list(self, user_id: str, collection: str) -> list[dict[str, Any]]:
        self._assert_array_collection(collection)
        return self.read_user(user_id)[collection]

    def get(self, user_id: str, collection: str, record_id: str) -> dict[str, Any] | None:
        return next((item for item in self.list(user_id, collection) if item.get("id") == record_id), None)

    def upsert(self, user_id: str, collection: str, payload: dict[str, Any]) -> dict[str, Any]:
        self._assert_array_collection(collection)
        data = self.read_user(user_id)
        current_time = now_string()
        record = {
            **payload,
            "id": payload.get("id") or create_id(collection),
            "createdAt": payload.get("createdAt") or current_time,
            "updatedAt": current_time,
        }
        exists = any(item.get("id") == record["id"] for item in data[collection])
        data[collection] = [
            {**item, **record} if item.get("id") == record["id"] else item
            for item in data[collection]
        ] if exists else [record, *data[collection]]
        self.write_user(user_id, data)
        return record

    def remove(self, user_id: str, collection: str, record_id: str) -> bool:
        self._assert_array_collection(collection)
        data = self.read_user(user_id)
        before = len(data[collection])
        data[collection] = [item for item in data[collection] if item.get("id") != record_id]
        self.write_user(user_id, data)
        return len(data[collection]) != before

    def get_singleton(self, user_id: str, collection: str) -> dict[str, Any]:
        self._assert_singleton_collection(collection)
        return self.read_user(user_id)[collection]

    def set_singleton(self, user_id: str, collection: str, payload: dict[str, Any]) -> dict[str, Any]:
        self._assert_singleton_collection(collection)
        data = self.read_user(user_id)
        data[collection] = {**data[collection], **payload, "updatedAt": now_string()}
        self.write_user(user_id, data)
        return data[collection]

    def export_user(self, user_id: str) -> dict[str, Any]:
        return self.read_user(user_id)

    def import_user(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        data = empty_user_data()
        for collection in ARRAY_COLLECTIONS:
            value = payload.get(collection)
            data[collection] = value if isinstance(value, list) else []
        for collection in SINGLETON_COLLECTIONS:
            value = payload.get(collection)
            data[collection] = value if isinstance(value, dict) else {}
        self.write_user(user_id, data)
        return data

    @staticmethod
    def _assert_array_collection(collection: str) -> None:
        if collection not in ARRAY_COLLECTIONS:
            raise ValueError(f"Unknown array collection: {collection}")

    @staticmethod
    def _assert_singleton_collection(collection: str) -> None:
        if collection not in SINGLETON_COLLECTIONS:
            raise ValueError(f"Unknown singleton collection: {collection}")

