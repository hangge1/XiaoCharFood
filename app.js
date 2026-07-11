const apiClient = require('./utils/apiClient.js')
const store = require('./utils/store.js')
const syncManager = require('./utils/syncManager.js')

App({
  onLaunch() {
    wx.login({
      success: res => {
        this.globalData.loginCode = res.code
        this.startBackendSync(res.code)
      },
      fail: () => {
        this.startBackendSync('')
      }
    })
  },
  startBackendSync(code) {
    apiClient.login(code)
      .then(user => {
        this.globalData.backendUser = user
      })
      .catch(() => {
        this.globalData.backendUser = {
          id: apiClient.getUserId(),
          devFallback: true
        }
      })
      .finally(() => {
        syncManager.syncLocalFirst(store.getSnapshot, store.replaceSnapshot)
          .then(() => {
            this.refreshVisiblePages()
          })
      })
  },
  refreshVisiblePages() {
    if (typeof getCurrentPages !== 'function') return
    getCurrentPages().forEach(page => {
      if (page && typeof page.refresh === 'function') {
        page.refresh()
      }
    })
  },
  globalData: {
    loginCode: '',
    userInfo: null,
    backendUser: null
  }
})
