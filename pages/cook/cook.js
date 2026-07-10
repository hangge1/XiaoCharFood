const store = require('../../utils/store.js')
const recommender = require('../../utils/recommender.js')

const QUICK_KEYWORDS = [
  { label: '清淡', icon: '🥬' },
  { label: '省事', icon: '⚡' },
  { label: '家常', icon: '🏠' },
  { label: '川菜', icon: '🌶️' },
  { label: '减肥', icon: '🥗' },
  { label: '增肌', icon: '💪' },
  { label: '高蛋白', icon: '🥚' },
  { label: '少油', icon: '💧' },
  { label: '微辣', icon: '🔥' },
  { label: '牛肉', icon: '🥩' },
  { label: '鸡蛋', icon: '🥚' },
  { label: '豆腐', icon: '⬜' }
]

const SLOT_ICONS = {
  早餐: '🥣',
  午餐: '🍱',
  晚餐: '🍲',
  加餐: '🍓'
}

Page({
  data: {
    quickKeywords: QUICK_KEYWORDS,
    keywordText: '清淡 省事',
    dayMenu: null,
    plans: []
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const dayMenu = recommender.suggestDayMenu(this.data.keywordText)
    this.setData({
      dayMenu: this.decorateDayMenu(dayMenu),
      plans: store.getPlans()
    })
  },

  decorateDayMenu(menu) {
    if (!menu) return menu
    return Object.assign({}, menu, {
      meals: menu.meals.map(meal => Object.assign({}, meal, {
        icon: SLOT_ICONS[meal.slot] || '🍽️'
      }))
    })
  },

  onKeywordInput(e) {
    this.setData({ keywordText: e.detail.value })
  },

  addKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword
    const parts = this.data.keywordText
      .split(/[、,，\s]+/)
      .map(item => item.trim())
      .filter(Boolean)
    const next = parts.includes(keyword)
      ? parts.filter(item => item !== keyword)
      : parts.concat(keyword)
    this.setData({ keywordText: next.join(' ') })
    this.refresh()
  },

  generateDayMenu() {
    this.refresh()
    wx.showToast({ title: '菜单已更新', icon: 'none' })
  },

  saveDayMenu() {
    const menu = this.data.dayMenu
    if (!menu) return
    const names = menu.meals.map(item => `${item.slot}:${item.name}`)
    store.savePlan({
      recipeName: `一日菜单：${menu.meals.map(item => item.name).join(' / ')}`,
      sceneTags: menu.keywords,
      ingredients: menu.shoppingList.map(item => item.name),
      minutes: menu.meals.reduce((sum, item) => sum + item.minutes, 0),
      reason: menu.note,
      status: 'day-menu'
    })
    this.setData({ plans: store.getPlans() })
    wx.showToast({ title: '已保存一日菜单', icon: 'success' })
    return names
  },

  recordMeal(e) {
    const index = Number(e.currentTarget.dataset.index)
    const meal = this.data.dayMenu && this.data.dayMenu.meals[index]
    if (!meal) return
    store.saveMeal({
      mealType: meal.slot,
      title: meal.name,
      note: `来自一日菜单：${meal.reason}`,
      tags: meal.tags.slice(0, 3)
    })
    wx.showToast({ title: `已记为${meal.slot}`, icon: 'success' })
  }
})
