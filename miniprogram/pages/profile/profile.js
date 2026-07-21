const { courses, lectures } = require('../../data/content')
const store = require('../../utils/store')
const { nowText } = require('../../utils/date')

Page({
  data: { completed: 0, read: 0, reflections: 0, ratingStats: { fluent: 0, fuzzy: 0, review: 0 }, fontSize: 'medium', lastTime: '尚无记录' },
  onShow() { this.refresh() },
  refresh() {
    const state = store.getState()
    const latest = store.latestRatings(state)
    const ratingStats = Object.values(latest).reduce((sum, item) => { sum[item.rating] += 1; return sum }, { fluent: 0, fuzzy: 0, review: 0 })
    this.setData({
      completed: courses.filter(item => store.courseStatus(state, item.id) === 'completed').length,
      read: lectures.filter(item => state.lectureStates[item.number] && state.lectureStates[item.number].status === 'read').length,
      reflections: state.reflections.length,
      ratingStats,
      fontSize: state.settings.fontSize,
      lastTime: state.updatedAt ? nowText(state.updatedAt) : '尚无记录'
    })
  },
  setFont(event) {
    const value = event.currentTarget.dataset.size
    store.update(state => { state.settings.fontSize = value })
    this.setData({ fontSize: value })
  },
  openReflections() { wx.navigateTo({ url: '/pages/reflections/reflections' }) },
  exportBackup() {
    const payload = store.exportPayload()
    const path = `${wx.env.USER_DATA_PATH}/弟子规学堂-备份-${Date.now()}.json`
    try {
      wx.getFileSystemManager().writeFileSync(path, JSON.stringify(payload), 'utf8')
      if (wx.shareFileMessage) wx.shareFileMessage({ filePath: path, fileName: '弟子规学堂-学习备份.json' })
      else wx.showModal({ title: '备份已生成', content: `文件已保存在小程序本地目录：${path}，当前微信版本不支持直接分享文件。`, showCancel: false })
    } catch (error) {
      wx.showModal({ title: '备份未能导出', content: '文件写入失败，现有学习记录未受影响。请清理微信存储空间后重试。', showCancel: false })
    }
  },
  importBackup() {
    wx.chooseMessageFile({ count: 1, type: 'file', extension: ['json'], success: result => {
      try {
        const text = wx.getFileSystemManager().readFileSync(result.tempFiles[0].path, 'utf8')
        const payload = JSON.parse(text)
        const next = store.validatePayload(payload)
        wx.showModal({
          title: '确认覆盖恢复？',
          content: `备份包含 ${next.sessions.length} 个学习轮次、${next.ratingEvents.length} 条背诵评级、${next.reflections.length} 条反思。恢复会完整覆盖当前记录，并先自动保留一份回滚快照。`,
          confirmText: '覆盖恢复', confirmColor: '#11110f',
          success: modal => {
            if (!modal.confirm) return
            try { store.restorePayload(payload); wx.showToast({ title: '恢复成功', icon: 'success' }); this.refresh() }
            catch (error) { wx.showModal({ title: '恢复失败，已回滚', content: `${error.message}。导入前的学习记录已恢复。`, showCancel: false }) }
          }
        })
      } catch (error) {
        wx.showModal({ title: '备份无法读取', content: `${error.message || '文件不是有效的 JSON 备份'}现有学习记录未改动。`, showCancel: false })
      }
    } })
  },
  resetAll() {
    wx.showModal({ title: '重置全部学习数据？', content: '将删除课程轮次、步骤进度、全部背诵评级、反思、讲稿阅读状态和设置。内置课程与讲稿不会删除。', confirmText: '继续', confirmColor: '#b5362e', success: first => {
      if (!first.confirm) return
      wx.showModal({ title: '再确认一次', content: '如果还需要当前记录，请先取消并导出备份。', confirmText: '确认删除', confirmColor: '#b5362e', success: second => { if (second.confirm) { store.reset(); this.refresh(); wx.showToast({ title: '已重置' }) } } })
    } })
  }
})
