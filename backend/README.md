# XiaoCharFood Python Backend

独立部署后端。小程序已经具备本地开发联动能力，现有页面仍然保持本地优先体验。

当前实现使用 Python 标准库，便于在没有额外依赖的环境中直接启动和测试。后续可以在 API 合同稳定后替换为 FastAPI + PostgreSQL。

## Commands

```powershell
python -m unittest discover -s tests
python -m src.server
```

## Environment

```text
PORT=3001
DATA_DIR=./data
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

开发阶段使用 `X-User-Id` 请求头隔离数据。正式微信登录接入后，应由后端根据 `wx.login` 返回的 code 换取 openid，再签发后端自己的登录态。

小程序端联动说明见：

```text
../docs/FRONTEND_BACKEND_SYNC.md
```
