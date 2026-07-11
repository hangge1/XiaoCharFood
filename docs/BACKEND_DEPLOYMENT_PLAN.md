# XiaoCharFood 独立后端部署方案

## 目标

XiaoCharFood 当前是纯微信小程序前端，所有业务数据保存在 `utils/store.js` 管理的本地缓存中。本阶段的目标是新增一个可以单独部署的后端工程，但不改变现有小程序运行逻辑。

后端建设分为两条线：

- 当前阶段：建立独立后端骨架、API 合同、基础测试和部署说明。
- 后续阶段：小程序通过数据仓储层逐步接入后端，实现多设备同步、家庭共享、图片存储和 AI 推荐能力。

## 当前边界

本次调整遵守以下约束：

- 不修改小程序页面调用方式。
- 不替换 `utils/store.js` 的本地存储逻辑。
- 不引入微信云开发作为长期后端。
- 后端先保持轻量、可运行、可测试，后续再替换持久化实现。

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
              +-- current: Python stdlib HTTP service + local JSON files
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

开发阶段用 `X-User-Id` 请求头隔离用户数据。正式接入微信登录后，应由后端通过 `wx.login` 的 `code` 换取 `openid`，再由服务端签发自己的登录态。小程序前端不允许保存或使用 `WECHAT_APP_SECRET`。

## 部署路径

### 第一阶段：单机可部署

```powershell
cd backend
python -m unittest discover -s tests
python -m src.server
```

环境变量：

```text
PORT=3001
DATA_DIR=./data
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

此阶段使用 Python 标准库实现 HTTP 服务和 JSON 文件存储，适合验证 API、数据结构和小程序接入方式，不适合作为多人长期生产数据库。API 合同稳定后，可以将 HTTP 层升级为 FastAPI，将 Repository 替换为 PostgreSQL/MySQL。

### 第二阶段：正式服务化

将 Repository 从 JSON 文件替换为数据库：

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

## 同步策略

推荐采用本地优先：

- 新增或编辑时先写本地，保证体验不被网络影响。
- 后台尝试同步到后端。
- 每条记录保留 `id`、`createdAt`、`updatedAt`。
- 冲突第一阶段使用 `updatedAt` 后写覆盖。
- 删除操作后续需要增加 tombstone，避免多端恢复已删除数据。

## 微信小程序上线注意点

独立后端需要准备 HTTPS 域名，并在微信公众平台配置为小程序合法请求域名。若后端部署在中国大陆服务器，域名和备案要求以微信公众平台和云厂商当前规则为准。

## 验证

当前后端测试命令：

```powershell
cd backend
python -m unittest discover -s tests
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
