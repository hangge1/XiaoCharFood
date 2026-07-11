from __future__ import annotations

from http.server import ThreadingHTTPServer

from .app import make_handler
from .config import load_config
from .repository_factory import create_repository


def main() -> None:
    config = load_config()
    repository = create_repository(config)
    server = ThreadingHTTPServer(("", config.port), make_handler(repository, config))
    print(f"XiaoCharFood backend listening on http://localhost:{config.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
