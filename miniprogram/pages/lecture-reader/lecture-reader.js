const { getLecture } = require('../../data/content')
const store = require('../../utils/store')

Page({
  data: { lecture: null, status: 'reading', statusLabel: '阅读中', fontClass: 'font-medium', paragraphIndex: 0 },
  onLoad(options) {
    this.number = Number(options.number)
    this.targetIndex = options.paragraphIndex !== undefined ? Number(options.paragraphIndex) : null
    const lecture = getLecture(this.number)
    if (!lecture) { wx.showModal({ title: '讲稿无法打开', content: '讲次引用已失效，请返回讲稿列表。', showCancel: false, success: () => wx.navigateBack() }); return }
    const state = store.getState()
    const saved = state.lectureStates[this.number] || { status: 'unread', paragraphIndex: 0 }
    const status = saved.status === 'read' ? 'read' : 'reading'
    const paragraphIndex = this.targetIndex !== null ? this.targetIndex : (saved.paragraphIndex || 0)
    const size = state.settings.fontSize || 'medium'
    state.lastVisited = { type: 'lecture', id: this.number, title: `细讲弟子规 · 第${this.number}讲`, at: Date.now() }
    store.saveState(state)
    store.saveLectureState(this.number, { status, paragraphIndex })
    this.setData({ lecture, status, statusLabel: status === 'read' ? '已读' : '阅读中', fontClass: `font-${size}`, paragraphIndex })
  },
  onReady() {
    setTimeout(() => wx.pageScrollTo({ selector: `#paragraph-${this.data.paragraphIndex}`, duration: 0 }), 100)
    this.observer = this.createIntersectionObserver({ thresholds: [0.25, 0.6], observeAll: true })
    this.observer.relativeToViewport({ top: -80, bottom: -300 }).observe('.paragraph', result => {
      if (result.intersectionRatio > 0.25) this.currentParagraph = Number(result.dataset.index || 0)
    })
  },
  onHide() { this.savePosition() },
  onUnload() { this.savePosition(); if (this.observer) this.observer.disconnect() },
  savePosition() { if (this.number) store.saveLectureState(this.number, { paragraphIndex: Number.isInteger(this.currentParagraph) ? this.currentParagraph : this.data.paragraphIndex, status: this.data.status }) },
  toggleRead() {
    const status = this.data.status === 'read' ? 'reading' : 'read'
    store.saveLectureState(this.number, { status })
    this.setData({ status, statusLabel: status === 'read' ? '已读' : '阅读中' })
    wx.showToast({ title: status === 'read' ? '讲稿已标记为已读' : '已取消讲稿已读', icon: 'none' })
  },
  openSearch() { wx.navigateTo({ url: `/pages/search/search?scope=lecture&lecture=${this.number}` }) }
})
