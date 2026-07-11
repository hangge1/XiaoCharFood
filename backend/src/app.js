'use strict'

const { URL } = require('node:url')
const { ARRAY_COLLECTIONS, SINGLETON_COLLECTIONS } = require('./repositories/fileRepository')
const wechatClient = require('./wechatClient')

const RESOURCE_TO_COLLECTION = {
  meals: 'meals',
  plans: 'plans',
  restaurants: 'restaurants',
  'restaurant-visits': 'restaurantVisits'
}

function createApp({ repository, config, authClient = wechatClient }) {
  return async function app(request, response) {
    try {
      await routeRequest({ request, response, repository, config, authClient })
    } catch (error) {
      sendJson(response, 500, {
        error: 'internal_error',
        message: error.message
      })
    }
  }
}

async function routeRequest(context) {
  const { request, response, repository, config, authClient } = context
  const url = new URL(request.url, 'http://localhost')
  const pathname = normalizePath(url.pathname)

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, null)
    return
  }

  if (request.method === 'GET' && pathname === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'xiaocharfood-backend'
    })
    return
  }

  if (request.method === 'POST' && pathname === '/api/auth/wechat-login') {
    const body = await readJson(request)
    if (!body.code) {
      sendJson(response, 400, { error: 'missing_code' })
      return
    }
    if (!config.wechatAppId || !config.wechatAppSecret) {
      sendJson(response, 501, { error: 'wechat_auth_not_configured' })
      return
    }
    const session = await authClient.exchangeCode({
      appId: config.wechatAppId,
      appSecret: config.wechatAppSecret,
      code: body.code
    })
    sendJson(response, 200, {
      user: {
        id: session.openid,
        unionId: session.unionid || ''
      }
    })
    return
  }

  if (pathname === '/api/sync/export' && request.method === 'GET') {
    sendJson(response, 200, repository.exportUser(getUserId(request)))
    return
  }

  if (pathname === '/api/sync/import' && request.method === 'PUT') {
    const body = await readJson(request)
    sendJson(response, 200, repository.importUser(getUserId(request), body))
    return
  }

  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== 'api') {
    sendJson(response, 404, { error: 'not_found' })
    return
  }

  const resource = parts[1]
  const id = parts[2] ? decodeURIComponent(parts[2]) : ''
  const userId = getUserId(request)

  if (SINGLETON_COLLECTIONS.includes(resource)) {
    await handleSingletonResource({ request, response, repository, userId, collection: resource })
    return
  }

  const collection = RESOURCE_TO_COLLECTION[resource]
  if (ARRAY_COLLECTIONS.includes(collection)) {
    await handleArrayResource({ request, response, repository, userId, collection, id })
    return
  }

  sendJson(response, 404, { error: 'not_found' })
}

async function handleSingletonResource({ request, response, repository, userId, collection }) {
  if (request.method === 'GET') {
    sendJson(response, 200, repository.getSingleton(userId, collection))
    return
  }

  if (request.method === 'PUT') {
    const body = await readJson(request)
    sendJson(response, 200, repository.setSingleton(userId, collection, body))
    return
  }

  sendJson(response, 405, { error: 'method_not_allowed' })
}

async function handleArrayResource({ request, response, repository, userId, collection, id }) {
  if (!id && request.method === 'GET') {
    sendJson(response, 200, repository.list(userId, collection))
    return
  }

  if (!id && request.method === 'POST') {
    const body = await readJson(request)
    sendJson(response, 201, repository.upsert(userId, collection, body))
    return
  }

  if (id && request.method === 'GET') {
    const item = repository.get(userId, collection, id)
    sendJson(response, item ? 200 : 404, item || { error: 'not_found' })
    return
  }

  if (id && request.method === 'PUT') {
    const body = await readJson(request)
    sendJson(response, 200, repository.upsert(userId, collection, Object.assign({}, body, { id })))
    return
  }

  if (id && request.method === 'DELETE') {
    const deleted = repository.remove(userId, collection, id)
    sendJson(response, deleted ? 200 : 404, deleted ? { deleted: true } : { error: 'not_found' })
    return
  }

  sendJson(response, 405, { error: 'method_not_allowed' })
}

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

function getUserId(request) {
  return request.headers['x-user-id'] || 'anonymous'
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', chunk => {
      body += chunk
    })
    request.on('end', () => {
      if (!body.trim()) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  })
  if (statusCode !== 204) {
    response.end(JSON.stringify(payload))
  } else {
    response.end()
  }
}

module.exports = {
  createApp
}

