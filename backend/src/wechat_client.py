from __future__ import annotations

import json
from urllib.parse import urlencode
from urllib.request import urlopen


def exchange_code(app_id: str, app_secret: str, code: str) -> dict:
    query = urlencode(
        {
            "appid": app_id,
            "secret": app_secret,
            "js_code": code,
            "grant_type": "authorization_code",
        }
    )
    with urlopen(f"https://api.weixin.qq.com/sns/jscode2session?{query}", timeout=10) as response:
        payload = json.loads(response.read().decode("utf-8"))

    if payload.get("errcode"):
        raise RuntimeError(payload.get("errmsg") or f"WeChat auth failed: {payload['errcode']}")

    return payload

