const store = require('./utils/store')

App({
  globalData: { contentVersion: '2.0' },
  onLaunch() {
    store.ensureState()
  }
})
