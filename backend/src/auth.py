from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any


class AuthError(Exception):
    pass


def _b64encode(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")


def _b64decode(payload: str) -> bytes:
    padding = "=" * (-len(payload) % 4)
    return base64.urlsafe_b64decode((payload + padding).encode("ascii"))


@dataclass(frozen=True)
class SessionService:
    secret: str
    ttl_seconds: int

    def issue(self, user_id: str, extra: dict[str, Any] | None = None) -> str:
        now = int(time.time())
        payload = {
            "sub": user_id,
            "iat": now,
            "exp": now + self.ttl_seconds,
        }
        if extra:
            payload.update(extra)

        encoded_payload = _b64encode(json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
        signature = self._sign(encoded_payload)
        return f"{encoded_payload}.{signature}"

    def verify(self, token: str) -> dict[str, Any]:
        parts = token.split(".")
        if len(parts) != 2:
            raise AuthError("invalid_token")

        encoded_payload, signature = parts
        expected = self._sign(encoded_payload)
        if not hmac.compare_digest(signature, expected):
            raise AuthError("invalid_token_signature")

        payload = json.loads(_b64decode(encoded_payload).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise AuthError("token_expired")
        if not payload.get("sub"):
            raise AuthError("missing_subject")
        return payload

    def _sign(self, encoded_payload: str) -> str:
        digest = hmac.new(
            self.secret.encode("utf-8"),
            encoded_payload.encode("ascii"),
            hashlib.sha256,
        ).digest()
        return _b64encode(digest)

