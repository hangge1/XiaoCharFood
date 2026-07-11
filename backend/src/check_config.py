from __future__ import annotations

from .config import load_config, validate_config


def main() -> None:
    config = load_config()
    validate_config(config)
    print("Backend configuration is valid.")


if __name__ == "__main__":
    main()

