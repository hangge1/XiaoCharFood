const store = require('../../utils/store.js')

Page({
  data: {
    preferences: {},
    profile: {},
    nicknameDraft: '',
    stats: {
      meals: 0,
      plans: 0,
      restaurants: 0
    },
    tasteInput: '',
    maxCookMinutes: 30
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const preferences = store.getPreferences()
    this.setData({
      preferences,
      profile: store.getProfile(),
      nicknameDraft: store.getProfile().nickname || '',
      tasteInput: preferences.tasteTags.join('、'),
      maxCookMinutes: preferences.maxCookMinutes,
      stats: {
        meals: store.getMeals().length,
        plans: store.getPlans().length,
        restaurants: store.getRestaurants().length
      }
    })
  },

  onNicknameInput(e) {
    this.setData({ nicknameDraft: e.detail.value })
  },

  saveProfile() {
    const nickname = this.data.nicknameDraft.trim()
    if (!nickname) {
      wx.showToast({ title: '称呼不能为空', icon: 'none' })
      return
    }
    store.saveProfile({ nickname })
    this.refresh()
    wx.showToast({ title: '已更新称呼', icon: 'success' })
  },

  onTasteInput(e) {
    this.setData({ tasteInput: e.detail.value })
  },

  onMinutesInput(e) {
    this.setData({ maxCookMinutes: e.detail.value })
  },

  savePreferences() {
    const tasteTags = this.data.tasteInput
      .split(/[、,，\s]+/)
      .map(item => item.trim())
      .filter(Boolean)

    store.savePreferences({
      tasteTags: tasteTags.length ? tasteTags : ['家常'],
      maxCookMinutes: Number(this.data.maxCookMinutes) || 30
    })
    this.refresh()
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  clearAll() {
    wx.showModal({
      title: '清空本地数据？',
      content: '这会删除本机上的饮食记录、做饭计划和餐厅记忆。',
      confirmText: '清空',
      confirmColor: '#C84F4F',
      success: res => {
        if (res.confirm) {
          store.clearAll()
          this.refresh()
          wx.showToast({ title: '已清空', icon: 'none' })
        }
      }
    })
  }
})
