const config = require('./backendConfig.js')

const STORAGE_KEYS = {
  backendUserId: 'xcf:backendUserId',
  deviceId: 'xcf:deviceId'
}

function getStored(key) {
  try {
    return wx.getStorageSync(key)
  } catch (error) {
    return ''
  }
}

function setStored(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (error) {
    // Ignore storage failures and keep the app local-first.
  }
}

function getDeviceId() {
  const existing = getStored(STORAGE_KEYS.deviceId)
  if (existing) return existing

  const id = `device_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
  setStored(STORAGE_KEYS.deviceId, id)
  return id
}

function getUserId() {
  return getStored(STORAGE_KEYS.backendUserId) || getDeviceId()
}

function setUserId(userId) {
  if (userId) {
    setStored(STORAGE_KEYS.backendUserId, userId)
  }
}

function request(path, options = {}) {
  if (!config.enabled) {
    return Promise.reject(new Error('backend_disabled'))
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.baseUrl}${path}`,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: config.timeout,
      header: Object.assign({
        'Content-Type': 'application/json',
        'X-User-Id': getUserId()
      }, options.header || {}),
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }

        const error = new Error((res.data && res.data.error) || `request_failed_${res.statusCode}`)
        error.statusCode = res.statusCode
        error.data = res.data
        reject(error)
      },
      fail: reject
    })
  })
}

function login(code) {
  if (!code) {
    return Promise.resolve({ id: getUserId(), devFallback: true })
  }

  return request('/api/auth/wechat-login', {
    method: 'POST',
    data: { code }
  }).then(data => {
    const user = data && data.user
    if (user && user.id) {
      setUserId(user.id)
      return user
    }
    return { id: getUserId(), devFallback: true }
  }).catch(error => {
    if (error.statusCode === 501 || error.message === 'backend_disabled') {
      return { id: getUserId(), devFallback: true }
    }
    throw error
  })
}

function health() {
  return request('/health')
}

function exportSnapshot() {
  return request('/api/sync/export')
}

function importSnapshot(snapshot) {
  return request('/api/sync/import', {
    method: 'PUT',
    data: snapshot
  })
}

module.exports = {
  login,
  health,
  exportSnapshot,
  importSnapshot,
  getUserId
}

