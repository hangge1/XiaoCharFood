const store = require('../../utils/store.js')

const SCENE_TAGS = ['约会', '家常', '朋友聚餐', '不想排队']

Page({
  data: {
    sceneTags: SCENE_TAGS,
    restaurants: [],
    keyword: '',
    onlyRevisit: false,
    mode: 'search',
    currentLocation: null,
    nearbyRestaurants: [],
    mapMarkers: [],
    mapCircles: [],
    mapCenter: {
      latitude: 39.9042,
      longitude: 116.4074
    },
    form: {
      name: '',
      averageCost: '',
      address: '',
      latitude: null,
      longitude: null,
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
    const nearbyRestaurants = this.data.currentLocation
      ? store.getNearbyRestaurants(this.data.currentLocation, 5)
        .map(restaurant => Object.assign({}, restaurant, {
          distanceText: `${restaurant.distanceKm.toFixed(1)}km`
        }))
      : []
    this.setData({
      restaurants: store.getRestaurantSummaries({
        keyword: this.data.keyword,
        revisitIntent: this.data.onlyRevisit ? '还想再去' : ''
      }),
      nearbyRestaurants,
      mapMarkers: this.buildMarkers(nearbyRestaurants),
      mapCircles: this.buildCircles()
    })
  },

  buildMarkers(restaurants) {
    return restaurants.map((restaurant, index) => ({
      id: index + 1,
      restaurantId: restaurant.id,
      latitude: Number(restaurant.latitude),
      longitude: Number(restaurant.longitude),
      width: 28,
      height: 28,
      callout: {
        content: `${restaurant.name} · ${restaurant.distanceText}`,
        color: '#20251F',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#FFFFFF',
        padding: 8,
        display: 'BYCLICK'
      },
      label: {
        content: restaurant.name,
        color: '#2F7D68',
        fontSize: 12,
        anchorX: -18,
        anchorY: 30,
        borderRadius: 6,
        bgColor: '#DDEFE8',
        padding: 4
      }
    }))
  },

  buildCircles() {
    if (!this.data.currentLocation) return []
    return [{
      latitude: this.data.currentLocation.latitude,
      longitude: this.data.currentLocation.longitude,
      radius: 5000,
      color: '#2F7D6844',
      fillColor: '#2F7D6811',
      strokeWidth: 1
    }]
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

  chooseRestaurantLocation() {
    wx.chooseLocation({
      success: res => {
        this.setData({
          'form.name': this.data.form.name || res.name,
          'form.address': res.address || res.name,
          'form.latitude': res.latitude,
          'form.longitude': res.longitude
        })
      },
      fail: () => {
        wx.showToast({ title: '可以先手动写店名', icon: 'none' })
      }
    })
  },

  locateNearby() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          currentLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          mapCenter: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          mode: 'map'
        })
        this.refresh()
      },
      fail: () => {
        wx.showToast({ title: '需要授权位置才能看附近', icon: 'none' })
      }
    })
  },

  openRestaurantLocation(e) {
    const id = e.currentTarget.dataset.id
    const restaurant = this.data.restaurants.concat(this.data.nearbyRestaurants).find(item => item.id === id)
    if (!restaurant || restaurant.latitude == null || restaurant.longitude == null) {
      wx.showToast({ title: '这家店还没有地址', icon: 'none' })
      return
    }
    wx.openLocation({
      latitude: Number(restaurant.latitude),
      longitude: Number(restaurant.longitude),
      name: restaurant.name,
      address: restaurant.address || restaurant.note || restaurant.name,
      scale: 16
    })
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
        address: '',
        latitude: null,
        longitude: null,
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
