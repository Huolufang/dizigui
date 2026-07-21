const { getCourse } = require('../../data/content')
const store = require('../../utils/store')
const { nowText } = require('../../utils/date')

Page({
  data: { reflections: [] },
  onShow() { this.refresh() },
  refresh() {
    const list = store.getState().reflections.slice().sort((a, b) => b.updatedAt - a.updatedAt).map(item => Object.assign({}, item, {
      courseTitle: getCourse(item.courseId).title,
      timeLabel: nowText(item.updatedAt),
      displayText: item.thoughtOnly ? '已思考（未写文字）' : item.text
    }))
    this.setData({ reflections: list })
  },
  edit(event) {
    const id = event.currentTarget.dataset.id
    const item = store.getState().reflections.find(record => record.id === id)
    if (!item) return
    wx.showModal({ title: '修改反思', editable: true, placeholderText: '写下你的思考', content: item.text || '', confirmText: '保存', success: result => {
      if (!result.confirm) return
      store.update(state => { const record = state.reflections.find(value => value.id === id); if (record) { record.text = result.content || ''; record.thoughtOnly = !result.content; record.updatedAt = Date.now() } })
      this.refresh()
    } })
  },
  remove(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({ title: '删除这条反思？', content: '删除后不可在小程序内撤销。', confirmText: '删除', confirmColor: '#b5362e', success: result => {
      if (!result.confirm) return
      store.update(state => {
        state.reflections = state.reflections.filter(item => item.id !== id)
        state.sessions.forEach(session => { if (session.reflectionId === id) session.reflectionId = '' })
      })
      this.refresh()
    } })
  }
})
