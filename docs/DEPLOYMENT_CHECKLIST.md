# XiaoCharFood 后端部署检查清单

## 部署前

- 确认后端使用 Python 3.12 或更高版本。
- 从 `backend/.env.example` 创建 `backend/.env`，不要提交 `.env`。
- 设置 `APP_ENV=production`。
- 设置 `ALLOW_DEV_AUTH=false`。
- 设置强随机 `SESSION_SECRET`，长度至少 32 个字符。
- 配置 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`。
- 单机验证阶段设置 `STORAGE_BACKEND=sqlite`。
- 确认 `SQLITE_PATH` 指向可持久化磁盘路径。

## 启动前校验

```powershell
cd backend
python -m src.check_config
python -m unittest discover -s tests
```

`APP_ENV=production` 时，配置校验会阻止默认 secret、开发登录、缺失微信密钥和 JSON 存储。

## 启动

```powershell
cd backend
python -m src.server
```

Windows 本地也可以使用：

```powershell
cd backend
.\scripts\start.ps1
```

## 健康检查

```powershell
cd backend
.\scripts\health_check.ps1
```

接口：

```text
GET /health
GET /ready
```

`/health` 用于确认进程存活。`/ready` 用于确认运行环境、存储后端和开发认证状态。

## 小程序侧

- 修改 `utils/backendConfig.js` 的 `baseUrl` 为 HTTPS 后端域名。
- 在微信公众平台配置合法 request 域名。
- 生产环境不能继续使用本地 HTTP 地址。
- 生产环境不能依赖开发者工具的“不校验合法域名”选项。

## 当前生产化缺口

- JSON/SQLite 仍是单机存储方案，多人长期使用建议迁移 PostgreSQL 或 MySQL。
- 后端当前为 Python 标准库 HTTP 服务，正式部署可进一步切换到 FastAPI + ASGI server。
- 微信登录路径已经预留，但需要真实小程序密钥和线上环境联调。

