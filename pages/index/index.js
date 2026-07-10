const store = require('../../utils/store.js')

const MEAL_OPTIONS = [
  { type: '早餐', icon: '🥣', accent: 'morning' },
  { type: '午餐', icon: '🍱', accent: 'noon' },
  { type: '晚餐', icon: '🍲', accent: 'night' },
  { type: '加餐', icon: '🍓', accent: 'snack' }
]
const TAGS = ['外食', '清淡', '偏油', '蔬菜少', '吃撑了', '满意']

Page({
  data: {
    today: '',
    mealOptions: MEAL_OPTIONS,
    tags: TAGS,
    todayMeals: [],
    review: {
      mealCount: 0,
      outsideCount: 0,
      indulgentCount: 0,
      oilyCount: 0,
      tips: []
    },
    profile: {
      nickname: ''
    },
    nicknameDraft: '',
    editingMealId: '',
    editingMealMeta: null,
    form: {
      mealType: '晚餐',
      title: '',
      note: '',
      tags: [],
      indulgent: false
    }
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const today = store.todayString()
    const todayMeals = store.getMealsByDate(today)
    const profile = store.getProfile()
    this.setData({
      today,
      todayMeals,
      review: store.getWeekReview(),
      profile,
      nicknameDraft: profile.nickname || this.data.nicknameDraft
    })
  },

  onNicknameInput(e) {
    this.setData({
      nicknameDraft: e.detail.value
    })
  },

  saveNickname() {
    const nickname = this.data.nicknameDraft.trim()
    if (!nickname) {
      wx.showToast({ title: '想怎么称呼你？', icon: 'none' })
      return
    }
    store.saveProfile({ nickname })
    this.refresh()
    wx.showToast({ title: '记住啦', icon: 'success' })
  },

  hideKeyboard() {
    if (wx.hideKeyboard) {
      wx.hideKeyboard()
    }
  },

  selectMealType(e) {
    this.hideKeyboard()
    this.setData({
      'form.mealType': e.currentTarget.dataset.type
    })
  },

  onTitleInput(e) {
    this.setData({
      'form.title': e.detail.value
    })
  },

  onNoteInput(e) {
    this.setData({
      'form.note': e.detail.value
    })
  },

  toggleTag(e) {
    this.hideKeyboard()
    const tag = e.currentTarget.dataset.tag
    const tags = this.data.form.tags
    const note = this.appendNoteToken(this.data.form.note, tag)
    this.setData({
      'form.tags': tags.includes(tag)
        ? tags.filter(item => item !== tag)
        : tags.concat(tag),
      'form.note': note
    })
  },

  toggleIndulgent() {
    this.hideKeyboard()
    const nextIndulgent = !this.data.form.indulgent
    this.setData({
      'form.indulgent': nextIndulgent,
      'form.note': nextIndulgent
        ? this.appendNoteToken(this.data.form.note, '放纵餐')
        : this.data.form.note
    })
  },

  appendNoteToken(note, token) {
    const current = `${note || ''}`.trim()
    if (!token || current.includes(token)) return current
    return current ? `${current} · ${token}` : token
  },

  resetMealForm() {
    this.setData({
      editingMealId: '',
      editingMealMeta: null,
      form: {
        mealType: '晚餐',
        title: '',
        note: '',
        tags: [],
        indulgent: false
      }
    })
  },

  saveMeal() {
    const form = this.data.form
    if (!form.mealType && !form.title && !form.note && form.tags.length === 0) {
      wx.showToast({ title: '随便写一点也可以', icon: 'none' })
      return
    }

    const title = form.title || `${form.mealType || '这一餐'}记录`
    const tags = form.indulgent && !form.tags.includes('放纵餐')
      ? form.tags.concat('放纵餐')
      : form.tags

    store.saveMeal({
      id: this.data.editingMealId || undefined,
      date: this.data.editingMealMeta && this.data.editingMealMeta.date,
      time: this.data.editingMealMeta && this.data.editingMealMeta.time,
      createdAt: this.data.editingMealMeta && this.data.editingMealMeta.createdAt,
      mealType: form.mealType,
      title,
      note: form.note,
      tags,
      indulgent: form.indulgent
    })

    const message = this.data.editingMealId ? '已更新' : '已记录'
    this.resetMealForm()
    this.refresh()
    wx.showToast({ title: message, icon: 'success' })
  },

  editMeal(e) {
    const id = e.currentTarget.dataset.id
    const meal = this.data.todayMeals.find(item => item.id === id)
    if (!meal) return
    const tags = (meal.tags || []).filter(tag => tag !== '放纵餐')
    this.setData({
      editingMealId: meal.id,
      editingMealMeta: {
        date: meal.date,
        time: meal.time,
        createdAt: meal.createdAt
      },
      form: {
        mealType: meal.mealType || '晚餐',
        title: meal.title || '',
        note: meal.note || '',
        tags,
        indulgent: Boolean(meal.indulgent || (meal.tags || []).includes('放纵餐'))
      }
    })
    if (wx.pageScrollTo) {
      wx.pageScrollTo({ scrollTop: 360, duration: 220 })
    }
  },

  cancelEdit() {
    this.resetMealForm()
  },

  deleteMeal(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条记录？',
      content: '删除后，本周回顾也会同步更新。',
      confirmText: '删除',
      confirmColor: '#C84F4F',
      success: res => {
        if (res.confirm) {
          store.deleteMeal(id)
          if (this.data.editingMealId === id) {
            this.resetMealForm()
          }
          this.refresh()
        }
      }
    })
  },

  goCook() {
    wx.switchTab({ url: '/pages/cook/cook' })
  }
})
