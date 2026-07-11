const apiClient = require('./apiClient.js')
const config = require('./backendConfig.js')

const ARRAY_KEYS = ['meals', 'plans', 'restaurants', 'restaurantVisits', 'deletedRecords']
const SINGLETON_KEYS = ['preferences', 'profile']
const SYNC_STATE_KEY = 'xcf:syncState'

let syncInFlight = false
let uploadTimer = null
let pendingUpload = null

function timestampValue(value) {
  if (!value) return 0
  const normalized = `${value}`.replace(' ', 'T')
  const parsed = Date.parse(normalized)
  return Number.isNaN(parsed) ? 0 : parsed
}

function tombstoneKey(tombstone) {
  return `${tombstone.collection}:${tombstone.id}`
}

function buildTombstoneMap(deletedRecords) {
  const map = {}
  ;(deletedRecords || []).forEach(record => {
    if (!record || !record.collection || !record.id) return
    const key = tombstoneKey(record)
    const existing = map[key]
    if (!existing || timestampValue(record.deletedAt) >= timestampValue(existing.deletedAt)) {
      map[key] = record
    }
  })
  return map
}

function mergeArrays(collection, localItems = [], remoteItems = [], tombstones = {}) {
  const byId = {}
  localItems.concat(remoteItems).forEach(item => {
    if (!item || !item.id) return
    const deleted = tombstones[`${collection}:${item.id}`]
    const existing = byId[item.id]
    if (!existing || timestampValue(item.updatedAt) >= timestampValue(existing.updatedAt)) {
      byId[item.id] = item
    }
    if (deleted && timestampValue(deleted.deletedAt) >= timestampValue(item.updatedAt)) {
      delete byId[item.id]
    }
  })

  return Object.keys(byId)
    .map(id => byId[id])
    .sort((a, b) => timestampValue(b.updatedAt || b.createdAt) - timestampValue(a.updatedAt || a.createdAt))
}

function mergeDeletedRecords(local = [], remote = []) {
  const map = buildTombstoneMap(local.concat(remote))
  return Object.keys(map).map(key => map[key])
}

function mergeSingleton(local = {}, remote = {}) {
  const localTime = timestampValue(local.updatedAt)
  const remoteTime = timestampValue(remote.updatedAt)
  return remoteTime > localTime
    ? Object.assign({}, local, remote)
    : Object.assign({}, remote, local)
}

function mergeSnapshots(local = {}, remote = {}) {
  const deletedRecords = mergeDeletedRecords(local.deletedRecords, remote.deletedRecords)
  const tombstonesByCollection = {}
  deletedRecords.forEach(record => {
    const collectionMap = tombstonesByCollection[record.collection] || {}
    collectionMap[`${record.collection}:${record.id}`] = record
    tombstonesByCollection[record.collection] = collectionMap
  })

  const merged = {
    deletedRecords
  }

  ARRAY_KEYS.filter(key => key !== 'deletedRecords').forEach(key => {
    merged[key] = mergeArrays(key, local[key], remote[key], tombstonesByCollection[key] || {})
  })

  SINGLETON_KEYS.forEach(key => {
    merged[key] = mergeSingleton(local[key], remote[key])
  })

  return merged
}

function setSyncState(state) {
  try {
    wx.setStorageSync(SYNC_STATE_KEY, Object.assign({
      updatedAt: new Date().toISOString()
    }, state))
  } catch (error) {
    // Sync state is diagnostic only.
  }
}

function syncLocalFirst(getSnapshot, replaceSnapshot) {
  if (!config.enabled || syncInFlight) {
    return Promise.resolve()
  }

  syncInFlight = true
  setSyncState({ status: 'syncing' })

  return apiClient.health()
    .then(() => apiClient.exportSnapshot())
    .then(remoteSnapshot => {
      const merged = mergeSnapshots(getSnapshot(), remoteSnapshot || {})
      replaceSnapshot(merged, { skipSync: true })
      return apiClient.importSnapshot(merged)
    })
    .then(() => {
      setSyncState({ status: 'synced', error: '' })
    })
    .catch(error => {
      setSyncState({ status: 'offline', error: error.message || 'sync_failed' })
    })
    .finally(() => {
      syncInFlight = false
      if (pendingUpload) {
        const next = pendingUpload
        pendingUpload = null
        queueUpload(next)
      }
    })
}

function queueUpload(getSnapshot) {
  if (!config.enabled || typeof getSnapshot !== 'function') {
    return
  }

  pendingUpload = getSnapshot
  if (uploadTimer) {
    clearTimeout(uploadTimer)
  }

  uploadTimer = setTimeout(() => {
    const snapshotProvider = pendingUpload
    pendingUpload = null
    uploadTimer = null

    if (syncInFlight || !snapshotProvider) {
      pendingUpload = snapshotProvider
      return
    }

    syncInFlight = true
    setSyncState({ status: 'uploading' })
    apiClient.importSnapshot(snapshotProvider())
      .then(() => {
        setSyncState({ status: 'synced', error: '' })
      })
      .catch(error => {
        setSyncState({ status: 'offline', error: error.message || 'upload_failed' })
      })
      .finally(() => {
        syncInFlight = false
        if (pendingUpload) {
          const next = pendingUpload
          pendingUpload = null
          queueUpload(next)
        }
      })
  }, 800)
}

module.exports = {
  syncLocalFirst,
  queueUpload,
  mergeSnapshots
}
