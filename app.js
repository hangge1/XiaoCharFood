App({
  onLaunch() {
    wx.login({
      success: res => {
        this.globalData.loginCode = res.code
      }
    })
  },
  globalData: {
    loginCode: '',
    userInfo: null
  }
})
