from __future__ import annotations

import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from src.app import make_handler
from src.repository import FileRepository


class TestConfig:
    wechat_app_id = ""
    wechat_app_secret = ""


class ApiTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        repository = FileRepository(Path(self.temp_dir.name))
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(repository, TestConfig()))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        host, port = self.server.server_address
        self.base_url = f"http://{host}:{port}"

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temp_dir.cleanup()

    def request(self, path: str, method: str = "GET", body: dict | None = None, user_id: str = "test-user") -> tuple[int, dict | list | None]:
        payload = None if body is None else json.dumps(body).encode("utf-8")
        request = Request(
            f"{self.base_url}{path}",
            data=payload,
            method=method,
            headers={
                "Content-Type": "application/json",
                "X-User-Id": user_id,
            },
        )
        try:
            with urlopen(request, timeout=5) as response:
                raw = response.read().decode("utf-8")
                return response.status, json.loads(raw) if raw else None
        except HTTPError as error:
            raw = error.read().decode("utf-8")
            return error.code, json.loads(raw) if raw else None

    def test_health_endpoint_reports_service_status(self) -> None:
        status, body = self.request("/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "ok")

    def test_meal_records_are_isolated_by_user_id(self) -> None:
        status, created = self.request(
            "/api/meals",
            method="POST",
            user_id="alice",
            body={"mealType": "晚餐", "title": "番茄牛腩", "tags": ["家常"]},
        )
        self.assertEqual(status, 201)
        self.assertEqual(created["title"], "番茄牛腩")
        self.assertTrue(created["id"])

        _, alice_meals = self.request("/api/meals", user_id="alice")
        self.assertEqual(len(alice_meals), 1)

        _, bob_meals = self.request("/api/meals", user_id="bob")
        self.assertEqual(len(bob_meals), 0)

    def test_singleton_preferences_can_be_updated_and_read_back(self) -> None:
        status, saved = self.request(
            "/api/preferences",
            method="PUT",
            body={"tasteTags": ["清淡"], "defaultPeople": 2},
        )
        self.assertEqual(status, 200)
        self.assertEqual(saved["tasteTags"], ["清淡"])
        self.assertEqual(saved["defaultPeople"], 2)
        self.assertIn("updatedAt", saved)

        _, loaded = self.request("/api/preferences")
        self.assertEqual(loaded["tasteTags"], ["清淡"])

    def test_array_records_can_be_deleted(self) -> None:
        _, created = self.request(
            "/api/restaurants",
            method="POST",
            body={"name": "小馆子", "revisitIntent": "还想再去"},
        )
        status, deleted = self.request(f"/api/restaurants/{created['id']}", method="DELETE")
        self.assertEqual(status, 200)
        self.assertTrue(deleted["deleted"])

        _, restaurants = self.request("/api/restaurants")
        self.assertEqual(len(restaurants), 0)


if __name__ == "__main__":
    unittest.main()

