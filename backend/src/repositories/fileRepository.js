'use strict'

const fs = require('node:fs')
const path = require('node:path')

const ARRAY_COLLECTIONS = ['meals', 'plans', 'restaurants', 'restaurantVisits']
const SINGLETON_COLLECTIONS = ['preferences', 'profile']

function emptyUserData() {
  return {
    meals: [],
    plans: [],
    restaurants: [],
    restaurantVisits: [],
    preferences: {},
    profile: {}
  }
}

function safeUserId(userId) {
  return String(userId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_')
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
}

function nowString() {
  const date = new Date()
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

class FileRepository {
  constructor(dataDir) {
    this.dataDir = dataDir
    fs.mkdirSync(this.dataDir, { recursive: true })
  }

  filePath(userId) {
    return path.join(this.dataDir, `${safeUserId(userId)}.json`)
  }

  readUser(userId) {
    const target = this.filePath(userId)
    if (!fs.existsSync(target)) {
      return emptyUserData()
    }

    const raw = fs.readFileSync(target, 'utf8')
    if (!raw.trim()) {
      return emptyUserData()
    }

    return Object.assign(emptyUserData(), JSON.parse(raw))
  }

  writeUser(userId, data) {
    const target = this.filePath(userId)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `${JSON.stringify(Object.assign(emptyUserData(), data), null, 2)}\n`, 'utf8')
  }

  list(userId, collection) {
    this.assertArrayCollection(collection)
    return this.readUser(userId)[collection]
  }

  get(userId, collection, id) {
    return this.list(userId, collection).find(item => item.id === id) || null
  }

  upsert(userId, collection, input) {
    this.assertArrayCollection(collection)
    const data = this.readUser(userId)
    const time = nowString()
    const item = Object.assign({}, input, {
      id: input.id || createId(collection),
      createdAt: input.createdAt || time,
      updatedAt: time
    })
    const exists = data[collection].some(entry => entry.id === item.id)
    data[collection] = exists
      ? data[collection].map(entry => entry.id === item.id ? Object.assign({}, entry, item) : entry)
      : [item].concat(data[collection])
    this.writeUser(userId, data)
    return item
  }

  remove(userId, collection, id) {
    this.assertArrayCollection(collection)
    const data = this.readUser(userId)
    const before = data[collection].length
    data[collection] = data[collection].filter(item => item.id !== id)
    this.writeUser(userId, data)
    return data[collection].length !== before
  }

  getSingleton(userId, collection) {
    this.assertSingletonCollection(collection)
    return this.readUser(userId)[collection]
  }

  setSingleton(userId, collection, input) {
    this.assertSingletonCollection(collection)
    const data = this.readUser(userId)
    data[collection] = Object.assign({}, data[collection], input, { updatedAt: nowString() })
    this.writeUser(userId, data)
    return data[collection]
  }

  exportUser(userId) {
    return this.readUser(userId)
  }

  importUser(userId, input) {
    const next = emptyUserData()
    ARRAY_COLLECTIONS.forEach(collection => {
      next[collection] = Array.isArray(input[collection]) ? input[collection] : []
    })
    SINGLETON_COLLECTIONS.forEach(collection => {
      next[collection] = input[collection] && typeof input[collection] === 'object' ? input[collection] : {}
    })
    this.writeUser(userId, next)
    return next
  }

  assertArrayCollection(collection) {
    if (!ARRAY_COLLECTIONS.includes(collection)) {
      throw new Error(`Unknown array collection: ${collection}`)
    }
  }

  assertSingletonCollection(collection) {
    if (!SINGLETON_COLLECTIONS.includes(collection)) {
      throw new Error(`Unknown singleton collection: ${collection}`)
    }
  }
}

module.exports = {
  FileRepository,
  ARRAY_COLLECTIONS,
  SINGLETON_COLLECTIONS
}

