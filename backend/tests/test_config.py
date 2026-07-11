from __future__ import annotations

import unittest
from pathlib import Path

from src.config import Config, ConfigError, validate_config


def make_config(**overrides):
    values = {
        "app_env": "development",
        "port": 3001,
        "data_dir": Path("data"),
        "wechat_app_id": "",
        "wechat_app_secret": "",
        "session_secret": "dev-only-change-me",
        "session_ttl_seconds": 3600,
        "allow_dev_auth": True,
        "storage_backend": "json",
        "sqlite_path": Path("data/test.sqlite3"),
    }
    values.update(overrides)
    return Config(**values)


class ConfigValidationTestCase(unittest.TestCase):
    def test_development_defaults_are_valid(self) -> None:
        validate_config(make_config())

    def test_production_rejects_unsafe_config(self) -> None:
        with self.assertRaises(ConfigError) as context:
            validate_config(make_config(app_env="production"))

        message = str(context.exception)
        self.assertIn("ALLOW_DEV_AUTH must be false", message)
        self.assertIn("SESSION_SECRET must be a strong production secret", message)
        self.assertIn("WECHAT_APP_ID and WECHAT_APP_SECRET are required", message)
        self.assertIn("STORAGE_BACKEND=json is not allowed", message)

    def test_production_accepts_hardened_config(self) -> None:
        validate_config(make_config(
            app_env="production",
            allow_dev_auth=False,
            session_secret="x" * 40,
            wechat_app_id="wx-test",
            wechat_app_secret="wechat-secret",
            storage_backend="sqlite",
        ))

    def test_rejects_unknown_storage_backend(self) -> None:
        with self.assertRaises(ConfigError):
            validate_config(make_config(storage_backend="unknown"))


if __name__ == "__main__":
    unittest.main()

