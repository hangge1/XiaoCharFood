# XiaoCharFood 前后端联动说明

## 当前状态

小程序已经具备和 Python 后端联动的基础能力：

- 启动时调用 `wx.login`，再尝试调用后端登录接口。
- 登录成功后保存后端签发的 session token，后续请求使用 `Authorization: Bearer <token>`。
- 开发环境未配置微信密钥时，前端通过 `/api/auth/dev-login` 用本地 device id 换取开发 token。
- 页面写入仍然先落本地缓存，保证体验不被网络影响。
- 后端可用时，小程序会自动同步完整数据快照。
- 启动同步完成后，会刷新当前页面，让远端合并数据可见。

## 本地启动

启动后端：

```powershell
cd backend
python -m src.server
```

默认地址：

```text
http://127.0.0.1:3001
```

小程序端配置在：

```text
utils/backendConfig.js
```

开发者工具里如需访问本地 HTTP 服务，需要在微信开发者工具中开启“不校验合法域名、web-view 域名、TLS 版本以及 HTTPS 证书”。

## 同步策略

当前策略是本地优先：

1. 用户操作立即写入 `wx.setStorageSync`。
2. `utils/store.js` 触发 `syncManager.queueUpload`。
3. `utils/apiClient.js` 携带后端 session token。
4. 后台把完整快照上传到 `/api/sync/import`。
5. 小程序启动时从 `/api/sync/export` 拉取远端快照。
5. `syncManager.mergeSnapshots` 按 `updatedAt` 合并本地和远端数据。
6. 删除记录通过 `deletedRecords` tombstone 防止旧数据被远端恢复。

## 相关文件

```text
app.js                    # 启动登录和首轮同步
utils/backendConfig.js    # 后端地址和开关
utils/apiClient.js        # wx.request 封装
utils/syncManager.js      # 快照同步、合并、删除标记处理
utils/store.js            # 本地数据层，写入后触发后台上传
backend/src/app.py        # Python HTTP API
backend/src/repository.py # JSON 文件 Repository
backend/src/sqlite_repository.py # SQLite Repository
backend/src/repository_factory.py # 存储后端选择
```

## 生产部署前必须补齐

当前联动已经适合本地开发和 API 验证，但生产部署还需要补齐：

- 后端部署到可公网访问的 HTTPS 域名。
- 微信公众平台配置合法 request 域名。
- 配置 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`。
- 配置强随机 `SESSION_SECRET`。
- 后端登录接口从微信 `code` 换取真实 `openid`，当前接口已预留该路径。
- 生产环境关闭 `ALLOW_DEV_AUTH`，禁止继续使用开发登录。
- 生产环境设置 `APP_ENV=production`，并通过 `python -m src.check_config`。
- 单机部署可以先使用 `STORAGE_BACKEND=sqlite`。
- 多人长期生产使用时，将 Repository 从 SQLite 迁移到 PostgreSQL 或 MySQL。
