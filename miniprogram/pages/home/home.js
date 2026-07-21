const { courses } = require('../../data/content')
const store = require('../../utils/store')

Page({
  data: { dueCount: 0, completedCount: 0, total: courses.length, active: null, next: courses[0], progress: 0, recentReading: null },
  onShow() {
    const state = store.getState()
    const activeSession = store.latestUnfinishedSession(state)
    const active = activeSession ? Object.assign({}, activeSession, { course: courses.find(item => item.id === activeSession.courseId), stepLabel: ['复习旧课', '学习原文', '课程讲解', '背诵练习', '理解反思'][activeSession.currentStep - 1] }) : null
    const completedCount = courses.filter(course => store.courseStatus(state, course.id) === 'completed').length
    const next = courses.find(course => store.courseStatus(state, course.id) === 'new') || courses[0]
    const latestLecture = Object.entries(state.lectureStates || {})
      .filter(([, lectureState]) => lectureState && lectureState.updatedAt)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]
    const recentReading = latestLecture ? {
      id: Number(latestLecture[0]),
      paragraphIndex: latestLecture[1].paragraphIndex || 0,
      title: `《细讲弟子规》第 ${latestLecture[0]} 讲`,
      subtitle: `上次读到第 ${(latestLecture[1].paragraphIndex || 0) + 1} 段`
    } : null
    this.setData({
      dueCount: store.dueUnits(state).length,
      completedCount,
      active,
      next,
      progress: Math.round(completedCount / courses.length * 100),
      recentReading
    })
  },
  startSuggested() {
    const session = store.startSession(this.data.next.id, false)
    wx.navigateTo({ url: `/pages/learn/learn?sessionId=${session.id}` })
  },
  continueLearning() { wx.navigateTo({ url: `/pages/learn/learn?sessionId=${this.data.active.id}` }) },
  goReview() { wx.switchTab({ url: '/pages/review/review' }) },
  goCourses() { wx.switchTab({ url: '/pages/courses/courses' }) },
  openRecent() {
    const item = this.data.recentReading
    if (!item) return
    wx.navigateTo({ url: `/pages/lecture-reader/lecture-reader?number=${item.id}&paragraphIndex=${item.paragraphIndex}` })
  }
})
