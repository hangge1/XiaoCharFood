const STORAGE_KEYS = {
  meals: 'xcf:meals',
  preferences: 'xcf:preferences',
  plans: 'xcf:plans',
  restaurants: 'xcf:restaurants',
  restaurantVisits: 'xcf:restaurantVisits',
  profile: 'xcf:profile'
}

const DEFAULT_PREFERENCES = {
  tasteTags: ['家常', '清淡'],
  avoidTags: [],
  defaultPeople: 2,
  maxCookMinutes: 30
}

function nowString() {
  const date = new Date()
  const pad = n => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function todayString(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const pad = n => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function timeString() {
  const date = new Date()
  const pad = n => `${n}`.padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
}

function read(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value || fallback
  } catch (error) {
    return fallback
  }
}

function write(key, value) {
  wx.setStorageSync(key, value)
  return value
}

function getMeals() {
  return read(STORAGE_KEYS.meals, [])
}

function saveMeal(input) {
  const meals = getMeals()
  const time = nowString()
  const meal = {
    id: input.id || createId('meal'),
    date: input.date || todayString(),
    time: input.time || timeString(),
    mealType: input.mealType || '',
    title: input.title || '',
    note: input.note || '',
    tags: input.tags || [],
    indulgent: Boolean(input.indulgent),
    planId: input.planId || '',
    createdAt: input.createdAt || time,
    updatedAt: time
  }
  const next = meals.some(item => item.id === meal.id)
    ? meals.map(item => item.id === meal.id ? meal : item)
    : [meal, ...meals]
  write(STORAGE_KEYS.meals, next)
  return meal
}

function deleteMeal(id) {
  const next = getMeals().filter(item => item.id !== id)
  write(STORAGE_KEYS.meals, next)
  return next
}

function getMealsByDate(date) {
  return getMeals().filter(item => item.date === date)
}

function getRecentMeals(days = 7) {
  const dates = new Set(Array.from({ length: days }, (_, index) => todayString(-index)))
  return getMeals().filter(item => dates.has(item.date))
}

function getWeekReview() {
  const meals = getRecentMeals(7)
  const outsideCount = meals.filter(item => item.tags.includes('外食')).length
  const indulgentCount = meals.filter(item => item.indulgent || item.tags.includes('放纵餐')).length
  const veggieLowCount = meals.filter(item => item.tags.includes('蔬菜少')).length
  const oilyCount = meals.filter(item => item.tags.includes('偏油')).length
  const tips = []

  if (outsideCount >= 3) tips.push(`本周外食 ${outsideCount} 次，可以考虑安排一顿家常饭。`)
  if (indulgentCount > 0) tips.push(`放纵餐记录了 ${indulgentCount} 次，明天可以选清淡一点。`)
  if (veggieLowCount > 0) tips.push('最近蔬菜偏少，做饭时可以加一道青菜。')
  if (oilyCount >= 2) tips.push('偏油标签出现较多，下一餐可以换个清爽做法。')
  if (meals.length === 0) tips.push('记录几顿后，这里会帮你回顾最近吃得怎么样。')

  return {
    mealCount: meals.length,
    outsideCount,
    indulgentCount,
    veggieLowCount,
    oilyCount,
    tips
  }
}

function getPreferences() {
  return Object.assign({}, DEFAULT_PREFERENCES, read(STORAGE_KEYS.preferences, {}))
}

function savePreferences(input) {
  return write(STORAGE_KEYS.preferences, Object.assign({}, getPreferences(), input, { updatedAt: nowString() }))
}

function getPlans() {
  return read(STORAGE_KEYS.plans, [])
}

function savePlan(input) {
  const plans = getPlans()
  const time = nowString()
  const plan = {
    id: input.id || createId('plan'),
    recipeName: input.recipeName || '',
    sceneTags: input.sceneTags || [],
    ingredients: input.ingredients || [],
    minutes: input.minutes || 0,
    reason: input.reason || '',
    status: input.status || 'planned',
    createdAt: input.createdAt || time,
    updatedAt: time
  }
  const next = plans.some(item => item.id === plan.id)
    ? plans.map(item => item.id === plan.id ? plan : item)
    : [plan, ...plans]
  write(STORAGE_KEYS.plans, next)
  return plan
}

function getRestaurants() {
  return read(STORAGE_KEYS.restaurants, [])
}

function getRestaurantVisits() {
  return read(STORAGE_KEYS.restaurantVisits, [])
}

function saveRestaurant(input) {
  const restaurants = getRestaurants()
  const time = nowString()
  const restaurant = {
    id: input.id || createId('restaurant'),
    name: input.name || '',
    averageCost: input.averageCost || '',
    sceneTags: input.sceneTags || [],
    revisitIntent: input.revisitIntent || '还想再去',
    note: input.note || '',
    createdAt: input.createdAt || time,
    updatedAt: time
  }
  const next = restaurants.some(item => item.id === restaurant.id)
    ? restaurants.map(item => item.id === restaurant.id ? restaurant : item)
    : [restaurant, ...restaurants]
  write(STORAGE_KEYS.restaurants, next)
  return restaurant
}

function saveRestaurantVisit(input) {
  const visits = getRestaurantVisits()
  const time = nowString()
  const visit = {
    id: input.id || createId('visit'),
    restaurantId: input.restaurantId,
    date: input.date || todayString(),
    dishes: input.dishes || '',
    cost: input.cost || '',
    note: input.note || '',
    createdAt: input.createdAt || time,
    updatedAt: time
  }
  const next = visits.some(item => item.id === visit.id)
    ? visits.map(item => item.id === visit.id ? visit : item)
    : [visit, ...visits]
  write(STORAGE_KEYS.restaurantVisits, next)
  return visit
}

function getRestaurantSummaries(filters = {}) {
  const visits = getRestaurantVisits()
  return getRestaurants()
    .map(restaurant => {
      const ownVisits = visits.filter(visit => visit.restaurantId === restaurant.id)
      return Object.assign({}, restaurant, {
        latestVisit: ownVisits[0] || null,
        visitCount: ownVisits.length
      })
    })
    .filter(restaurant => {
      const keyword = (filters.keyword || '').trim()
      const matchKeyword = !keyword ||
        restaurant.name.includes(keyword) ||
        restaurant.note.includes(keyword) ||
        (restaurant.latestVisit && `${restaurant.latestVisit.dishes} ${restaurant.latestVisit.note}`.includes(keyword))
      const matchRevisit = !filters.revisitIntent || restaurant.revisitIntent === filters.revisitIntent
      return matchKeyword && matchRevisit
    })
}

function clearAll() {
  Object.keys(STORAGE_KEYS).forEach(key => wx.removeStorageSync(STORAGE_KEYS[key]))
}

function getProfile() {
  return read(STORAGE_KEYS.profile, {
    nickname: ''
  })
}

function saveProfile(input) {
  return write(STORAGE_KEYS.profile, Object.assign({}, getProfile(), input, { updatedAt: nowString() }))
}

module.exports = {
  todayString,
  getMeals,
  saveMeal,
  deleteMeal,
  getMealsByDate,
  getRecentMeals,
  getWeekReview,
  getPreferences,
  savePreferences,
  getPlans,
  savePlan,
  getRestaurants,
  saveRestaurant,
  getRestaurantVisits,
  saveRestaurantVisit,
  getRestaurantSummaries,
  clearAll,
  getProfile,
  saveProfile
}
