from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from typing import Any
from urllib.parse import unquote, urlparse

from .repository import ARRAY_COLLECTIONS, SINGLETON_COLLECTIONS, FileRepository
from .wechat_client import exchange_code


RESOURCE_TO_COLLECTION = {
    "meals": "meals",
    "plans": "plans",
    "restaurants": "restaurants",
    "restaurant-visits": "restaurantVisits",
}


def make_handler(repository: FileRepository, config):
    class XiaoCharFoodHandler(BaseHTTPRequestHandler):
        server_version = "XiaoCharFoodBackend/0.1"

        def do_OPTIONS(self) -> None:
            self._send_json(HTTPStatus.NO_CONTENT, None)

        def do_GET(self) -> None:
            self._route()

        def do_POST(self) -> None:
            self._route()

        def do_PUT(self) -> None:
            self._route()

        def do_DELETE(self) -> None:
            self._route()

        def log_message(self, format: str, *args: Any) -> None:
            return

        def _route(self) -> None:
            try:
                path = urlparse(self.path).path.rstrip("/") or "/"
                if self.command == "GET" and path == "/health":
                    self._send_json(HTTPStatus.OK, {"status": "ok", "service": "xiaocharfood-backend"})
                    return

                if self.command == "POST" and path == "/api/auth/wechat-login":
                    self._handle_wechat_login()
                    return

                if self.command == "GET" and path == "/api/sync/export":
                    self._send_json(HTTPStatus.OK, repository.export_user(self._user_id()))
                    return

                if self.command == "PUT" and path == "/api/sync/import":
                    self._send_json(HTTPStatus.OK, repository.import_user(self._user_id(), self._read_json()))
                    return

                parts = [part for part in path.split("/") if part]
                if len(parts) < 2 or parts[0] != "api":
                    self._send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})
                    return

                resource = parts[1]
                record_id = unquote(parts[2]) if len(parts) > 2 else ""
                if resource in SINGLETON_COLLECTIONS:
                    self._handle_singleton(resource)
                    return

                collection = RESOURCE_TO_COLLECTION.get(resource)
                if collection in ARRAY_COLLECTIONS:
                    self._handle_array(collection, record_id)
                    return

                self._send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})
            except json.JSONDecodeError:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid_json"})
            except Exception as error:
                self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "internal_error", "message": str(error)})

        def _handle_wechat_login(self) -> None:
            body = self._read_json()
            code = body.get("code")
            if not code:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "missing_code"})
                return
            if not config.wechat_app_id or not config.wechat_app_secret:
                self._send_json(HTTPStatus.NOT_IMPLEMENTED, {"error": "wechat_auth_not_configured"})
                return

            session = exchange_code(config.wechat_app_id, config.wechat_app_secret, code)
            self._send_json(
                HTTPStatus.OK,
                {
                    "user": {
                        "id": session["openid"],
                        "unionId": session.get("unionid", ""),
                    }
                },
            )

        def _handle_singleton(self, collection: str) -> None:
            user_id = self._user_id()
            if self.command == "GET":
                self._send_json(HTTPStatus.OK, repository.get_singleton(user_id, collection))
                return
            if self.command == "PUT":
                self._send_json(HTTPStatus.OK, repository.set_singleton(user_id, collection, self._read_json()))
                return
            self._send_json(HTTPStatus.METHOD_NOT_ALLOWED, {"error": "method_not_allowed"})

        def _handle_array(self, collection: str, record_id: str) -> None:
            user_id = self._user_id()
            if not record_id and self.command == "GET":
                self._send_json(HTTPStatus.OK, repository.list(user_id, collection))
                return
            if not record_id and self.command == "POST":
                self._send_json(HTTPStatus.CREATED, repository.upsert(user_id, collection, self._read_json()))
                return
            if record_id and self.command == "GET":
                record = repository.get(user_id, collection, record_id)
                self._send_json(HTTPStatus.OK if record else HTTPStatus.NOT_FOUND, record or {"error": "not_found"})
                return
            if record_id and self.command == "PUT":
                payload = {**self._read_json(), "id": record_id}
                self._send_json(HTTPStatus.OK, repository.upsert(user_id, collection, payload))
                return
            if record_id and self.command == "DELETE":
                deleted = repository.remove(user_id, collection, record_id)
                self._send_json(
                    HTTPStatus.OK if deleted else HTTPStatus.NOT_FOUND,
                    {"deleted": True} if deleted else {"error": "not_found"},
                )
                return
            self._send_json(HTTPStatus.METHOD_NOT_ALLOWED, {"error": "method_not_allowed"})

        def _read_json(self) -> dict[str, Any]:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length == 0:
                return {}
            raw = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw) if raw.strip() else {}

        def _user_id(self) -> str:
            return self.headers.get("X-User-Id") or "anonymous"

        def _send_json(self, status: HTTPStatus, payload: Any) -> None:
            body = b"" if status == HTTPStatus.NO_CONTENT else json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-User-Id")
            self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if body:
                self.wfile.write(body)

    return XiaoCharFoodHandler

