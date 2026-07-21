const { courses } = require('../../data/content')
const store = require('../../utils/store')

Page({
  data: { courses: [], completed: 0 },
  onShow() {
    const state = store.getState()
    const list = courses.map(item => {
      const status = store.courseStatus(state, item.id)
      const session = state.sessions.filter(s => s.courseId === item.id && s.status !== 'completed').sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)[0]
      return Object.assign({}, item, { status, statusLabel: status === 'completed' ? '已完成' : status === 'learning' ? `学习中 · 第${session.currentStep}步` : '未开始' })
    })
    this.setData({ courses: list, completed: list.filter(item => item.status === 'completed').length })
  },
  openCourse(event) { wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${event.currentTarget.dataset.id}` }) },
  openSearch() { wx.navigateTo({ url: '/pages/search/search?scope=course' }) }
})
