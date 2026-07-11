'use strict'

const path = require('node:path')

function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT || 3001),
    dataDir: path.resolve(env.DATA_DIR || path.join(__dirname, '..', 'data')),
    wechatAppId: env.WECHAT_APP_ID || '',
    wechatAppSecret: env.WECHAT_APP_SECRET || ''
  }
}

module.exports = {
  loadConfig
}

