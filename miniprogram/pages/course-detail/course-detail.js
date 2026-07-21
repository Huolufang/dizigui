const { getCourse } = require('../../data/content')
const store = require('../../utils/store')

Page({
  data: { course: null, status: 'new', statusLabel: '未开始', session: null, completedSteps: 0 },
  onLoad(options) { this.courseId = options.id; this.unitId = options.unitId || ''; this.load() },
  onReady() { this.scrollToUnit() },
  onShow() { if (this.courseId) this.load() },
  load() {
    const course = getCourse(this.courseId)
    const state = store.getState()
    const status = store.courseStatus(state, course.id)
    const session = state.sessions.filter(item => item.courseId === course.id && item.status !== 'completed').sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)[0] || null
    state.lastVisited = { type: 'course', id: course.id, title: course.chapter, subtitle: course.units[0].text, at: Date.now() }
    store.saveState(state)
    this.setData({ course, status, session, completedSteps: session ? session.completedSteps.length : 0, statusLabel: status === 'completed' ? '已完成' : status === 'learning' ? '学习中' : '未开始' }, () => this.scrollToUnit())
  },
  scrollToUnit() { if (this.unitId) setTimeout(() => wx.pageScrollTo({ selector: `#${this.unitId}`, duration: 250 }), 80) },
  start() {
    const relearn = this.data.status === 'completed'
    if (relearn) {
      wx.showModal({ title: '重新学习本课？', content: '将创建独立学习轮次，历史完成事实、反思和背诵评级会保留。', confirmText: '开始重学', success: result => { if (result.confirm) this.openSession(store.startSession(this.data.course.id, true).id) } })
    } else this.openSession(store.startSession(this.data.course.id, false).id)
  },
  openStep(event) {
    const step = Number(event.currentTarget.dataset.step)
    const enter = relearn => {
      const session = store.startSession(this.data.course.id, relearn)
      store.setCurrentStep(session.id, step)
      this.openSession(session.id)
    }
    if (this.data.status === 'completed') {
      wx.showModal({ title: '重新学习本课？', content: `将创建新的学习轮次，并直接进入第 ${step} 步。历史记录会保留。`, confirmText: '开始重学', success: result => { if (result.confirm) enter(true) } })
    } else enter(false)
  },
  openSession(id) { wx.navigateTo({ url: `/pages/learn/learn?sessionId=${id}` }) },
  openLecture(event) { wx.navigateTo({ url: `/pages/lecture-reader/lecture-reader?number=${event.currentTarget.dataset.number}` }) }
})
