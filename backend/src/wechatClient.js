'use strict'

const https = require('node:https')

function exchangeCode({ appId, appSecret, code }) {
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
  url.searchParams.set('appid', appId)
  url.searchParams.set('secret', appSecret)
  url.searchParams.set('js_code', code)
  url.searchParams.set('grant_type', 'authorization_code')

  return new Promise((resolve, reject) => {
    https.get(url, response => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => {
        body += chunk
      })
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          if (parsed.errcode) {
            reject(new Error(parsed.errmsg || `WeChat auth failed: ${parsed.errcode}`))
            return
          }
          resolve(parsed)
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

module.exports = {
  exchangeCode
}

