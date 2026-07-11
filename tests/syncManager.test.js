const assert = require('node:assert/strict')
const syncManager = require('../utils/syncManager.js')

function run() {
  const merged = syncManager.mergeSnapshots({
    meals: [{
      id: 'meal_1',
      title: '本地新记录',
      updatedAt: '2026-07-11 12:00:00'
    }],
    plans: [],
    restaurants: [],
    restaurantVisits: [],
    deletedRecords: [{
      collection: 'meals',
      id: 'meal_2',
      deletedAt: '2026-07-11 13:00:00'
    }],
    preferences: {
      defaultPeople: 2,
      updatedAt: '2026-07-11 10:00:00'
    },
    profile: {
      nickname: '本地',
      updatedAt: '2026-07-11 10:00:00'
    }
  }, {
    meals: [{
      id: 'meal_1',
      title: '远端旧记录',
      updatedAt: '2026-07-11 11:00:00'
    }, {
      id: 'meal_2',
      title: '应被删除的远端记录',
      updatedAt: '2026-07-11 12:30:00'
    }],
    plans: [],
    restaurants: [],
    restaurantVisits: [],
    deletedRecords: [],
    preferences: {
      defaultPeople: 3,
      updatedAt: '2026-07-11 14:00:00'
    },
    profile: {
      nickname: '远端',
      updatedAt: '2026-07-11 09:00:00'
    }
  })

  assert.equal(merged.meals.length, 1)
  assert.equal(merged.meals[0].id, 'meal_1')
  assert.equal(merged.meals[0].title, '本地新记录')
  assert.equal(merged.preferences.defaultPeople, 3)
  assert.equal(merged.profile.nickname, '本地')
  assert.equal(merged.deletedRecords.length, 1)
}

run()
console.log('syncManager tests passed')

