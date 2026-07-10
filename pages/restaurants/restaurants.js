const store = require('../../utils/store.js')

const SCENE_TAGS = ['约会', '家常', '朋友聚餐', '不想排队']

Page({
  data: {
    sceneTags: SCENE_TAGS,
    restaurants: [],
    keyword: '',
    onlyRevisit: false,
    mode: 'search',
    form: {
      name: '',
      averageCost: '',
      sceneTags: [],
      revisitIntent: '还想再去',
      note: '',
      dishes: '',
      cost: ''
    }
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    this.setData({
      restaurants: store.getRestaurantSummaries({
        keyword: this.data.keyword,
        revisitIntent: this.data.onlyRevisit ? '还想再去' : ''
      })
    })
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
    this.refresh()
  },

  toggleOnlyRevisit() {
    this.setData({ onlyRevisit: !this.data.onlyRevisit })
    this.refresh()
  },

  setMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode })
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [`form.${key}`]: e.detail.value })
  },

  toggleSceneTag(e) {
    const tag = e.currentTarget.dataset.tag
    const tags = this.data.form.sceneTags
    this.setData({
      'form.sceneTags': tags.includes(tag)
        ? tags.filter(item => item !== tag)
        : tags.concat(tag)
    })
  },

  saveRestaurant() {
    const form = this.data.form
    if (!form.name.trim()) {
      wx.showToast({ title: '先写店名', icon: 'none' })
      return
    }
    const restaurant = store.saveRestaurant(form)
    if (form.dishes || form.cost || form.note) {
      store.saveRestaurantVisit({
        restaurantId: restaurant.id,
        dishes: form.dishes,
        cost: form.cost || form.averageCost,
        note: form.note
      })
    }
    this.setData({
      form: {
        name: '',
        averageCost: '',
        sceneTags: [],
        revisitIntent: '还想再去',
        note: '',
        dishes: '',
        cost: ''
      }
    })
    this.refresh()
    wx.showToast({ title: '已保存', icon: 'success' })
    this.setData({ mode: 'search' })
  }
})
