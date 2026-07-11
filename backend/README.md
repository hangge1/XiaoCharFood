# XiaoCharFood Backend

独立部署后端骨架。当前不接入小程序前端，现有小程序仍然使用本地存储运行。

## Commands

```powershell
npm test
npm start
```

## Environment

```text
PORT=3001
DATA_DIR=./data
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

开发阶段使用 `X-User-Id` 请求头隔离数据。正式微信登录接入后，应由后端根据 `wx.login` 返回的 code 换取 openid，再签发后端自己的登录态。

