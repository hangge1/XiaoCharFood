const store = require('../../utils/store.js')
const recommender = require('../../utils/recommender.js')

const QUICK_KEYWORDS = ['清淡', '省事', '减肥', '增肌', '高蛋白', '少油', '微辣', '鸡蛋', '番茄', '土豆']

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
    this.setData({
      dayMenu: recommender.suggestDayMenu(this.data.keywordText),
      plans: store.getPlans()
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
