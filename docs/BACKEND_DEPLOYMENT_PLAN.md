# XiaoCharFood 独立后端部署方案

## 目标

XiaoCharFood 已具备 Python 独立后端和本地开发联动能力。小程序仍然保持本地优先体验，所有业务数据先写入 `utils/store.js` 管理的本地缓存；后端可用时再自动同步快照。

后端建设分为两条线：

- 当前阶段：建立独立 Python 后端、API 合同、基础测试、本地前后端同步和部署说明。
- 后续阶段：完成真实微信登录态、数据库持久化、家庭共享、图片存储和 AI 推荐能力。

## 当前边界

本次调整遵守以下约束：

- 不修改小程序页面调用方式。
- 不破坏 `utils/store.js` 的本地优先存储逻辑。
- 不引入微信云开发作为长期后端。
- 后端先保持轻量、可运行、可测试，当前用 JSON 文件存储，后续再替换为数据库。

## 推荐架构

```text
WeChat Mini Program
        |
        | future: wx.request over HTTPS
        v
Backend API
        |
        +-- Auth Service
        |     `-- WeChat code -> openid
        |
        +-- Data API
        |     +-- meals
        |     +-- preferences
        |     +-- plans
        |     +-- restaurants
        |     +-- restaurantVisits
        |     `-- profile
        |
        `-- Repository
              +-- current: JSON files or SQLite
              `-- future: PostgreSQL/MySQL
```

## 数据模型

后端字段保持和当前 `utils/store.js` 同构，避免前端迁移时发生语义变化。

| Domain | Current local key | Backend resource |
|---|---|---|
| 饭卡记录 | `xcf:meals` | `/api/meals` |
| 偏好设置 | `xcf:preferences` | `/api/preferences` |
| 菜单计划 | `xcf:plans` | `/api/plans` |
| 餐厅 | `xcf:restaurants` | `/api/restaurants` |
| 餐厅访问记录 | `xcf:restaurantVisits` | `/api/restaurant-visits` |
| 用户资料 | `xcf:profile` | `/api/profile` |

## API 第一阶段

当前后端已经提供以下基础接口：

```text
GET    /health
POST   /api/auth/wechat-login
POST   /api/auth/dev-login

GET    /api/meals
POST   /api/meals
GET    /api/meals/:id
PUT    /api/meals/:id
DELETE /api/meals/:id

GET    /api/plans
POST   /api/plans
GET    /api/plans/:id
PUT    /api/plans/:id
DELETE /api/plans/:id

GET    /api/restaurants
POST   /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

GET    /api/restaurant-visits
POST   /api/restaurant-visits
GET    /api/restaurant-visits/:id
PUT    /api/restaurant-visits/:id
DELETE /api/restaurant-visits/:id

GET    /api/preferences
PUT    /api/preferences
GET    /api/profile
PUT    /api/profile

GET    /api/sync/export
PUT    /api/sync/import
```

后端会签发 session token，业务接口优先使用 `Authorization: Bearer <token>` 识别用户。开发阶段可以通过 `/api/auth/dev-login` 使用本地 device id 换取开发 token，并保留 `X-User-Id` 作为本地调试兜底。正式接入微信登录后，应由后端通过 `wx.login` 的 `code` 换取 `openid`，再由服务端签发自己的登录态。小程序前端不允许保存或使用 `WECHAT_APP_SECRET`。

## 部署路径

### 第一阶段：单机可部署

```powershell
cd backend
python -m unittest discover -s tests
python -m src.server
```

环境变量：

```text
APP_ENV=development
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

此阶段使用 Python 标准库实现 HTTP 服务，并支持 JSON 文件与 SQLite 两种 Repository。JSON 适合本地调试；SQLite 更适合单机部署验证。API 合同稳定后，可以将 HTTP 层升级为 FastAPI，将 Repository 替换为 PostgreSQL/MySQL。

后端会自动读取 `backend/.env`，可以从 `backend/.env.example` 复制一份作为本地配置文件。`.env` 不能提交。

生产环境必须通过配置校验：

```powershell
cd backend
python -m src.check_config
```

`APP_ENV=production` 时会阻止默认 `SESSION_SECRET`、开发登录、缺失微信密钥和 JSON 存储。

小程序开发环境默认请求地址在 `utils/backendConfig.js`：

```text
http://127.0.0.1:3001
```

### 第二阶段：正式服务化

将 Repository 从 JSON 文件替换为数据库：

- SQLite：当前已支持，适合单机部署验证，不适合作为多人长期生产数据库。
- PostgreSQL：推荐长期使用，适合共享空间、统计、查询和后续 AI 特征沉淀。
- MySQL：也可行，部署门槛低。
- Redis：只作为缓存或会话存储，不作为主数据源。

### 第三阶段：小程序接入

前端接入时不要让页面直接调用 `wx.request`。建议新增：

```text
utils/localStore.js
utils/remoteStore.js
utils/repository.js
```

页面继续调用稳定的数据接口，由 `repository.js` 负责本地优先、远端同步、冲突合并和失败降级。

当前已经落地的第一版接入文件：

```text
utils/backendConfig.js
utils/apiClient.js
utils/syncManager.js
```

## 同步策略

推荐采用本地优先：

- 新增或编辑时先写本地，保证体验不被网络影响。
- 后台尝试同步到后端。
- 每条记录保留 `id`、`createdAt`、`updatedAt`。
- 冲突第一阶段使用 `updatedAt` 后写覆盖。
- 删除操作使用 `deletedRecords` tombstone，避免多端恢复已删除数据。

## 微信小程序上线注意点

独立后端需要准备 HTTPS 域名，并在微信公众平台配置为小程序合法请求域名。若后端部署在中国大陆服务器，域名和备案要求以微信公众平台和云厂商当前规则为准。

## 验证

当前后端测试命令：

```powershell
cd backend
python -m unittest discover -s tests
```

前端同步合并测试：

```powershell
node tests/syncManager.test.js
```

当前小程序语法检查：

```powershell
node --check app.js
node --check utils/store.js
node --check utils/recommender.js
node --check pages/index/index.js
node --check pages/cook/cook.js
node --check pages/restaurants/restaurants.js
node --check pages/mine/mine.js
```
