# XiaoCharFood Python Backend

独立部署后端。小程序已经具备本地开发联动能力，现有页面仍然保持本地优先体验。

当前实现使用 Python 标准库，便于在没有额外依赖的环境中直接启动和测试。后续可以在 API 合同稳定后替换为 FastAPI + PostgreSQL。

## Commands

```powershell
python -m unittest discover -s tests
python -m src.server
```

Windows convenience scripts:

```powershell
.\scripts\start.ps1
.\scripts\health_check.ps1
```

## Environment

```text
PORT=3001
DATA_DIR=./data
STORAGE_BACKEND=json
SQLITE_PATH=./data/xiaocharfood.sqlite3
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
SESSION_SECRET=replace_with_a_long_random_secret
SESSION_TTL_SECONDS=2592000
ALLOW_DEV_AUTH=true
```

后端会签发 session token，业务接口优先使用 `Authorization: Bearer <token>` 识别用户。开发阶段可以开启 `ALLOW_DEV_AUTH=true`，通过 `/api/auth/dev-login` 为本地 device id 签发 token，并保留 `X-User-Id` 作为本地调试兜底。生产环境应关闭开发认证，设置强随机 `SESSION_SECRET`，并通过微信登录获取 openid。

`STORAGE_BACKEND` 支持：

- `json`：默认本地 JSON 文件，适合调试。
- `sqlite`：单机部署建议选项，使用 `SQLITE_PATH` 指定数据库文件。

复制 `.env.example` 为 `.env` 后可以用文件管理本地运行配置；`.env` 不应提交。

小程序端联动说明见：

```text
../docs/FRONTEND_BACKEND_SYNC.md
```
