const { lectures } = require('../../data/content')
const store = require('../../utils/store')

Page({
  data: { lectures: [], readCount: 0 },
  onShow() {
    const states = store.getState().lectureStates
    const list = lectures.map(item => Object.assign({}, item, {
      numberLabel: String(item.number).padStart(2, '0'),
      status: (states[item.number] && states[item.number].status) || 'unread',
      statusLabel: !states[item.number] || states[item.number].status === 'unread' ? '未读' : states[item.number].status === 'read' ? '已读' : '阅读中',
      paragraphCount: item.paragraphs.length
    }))
    this.setData({ lectures: list, readCount: list.filter(item => item.status === 'read').length })
  },
  openLecture(event) { wx.navigateTo({ url: `/pages/lecture-reader/lecture-reader?number=${event.currentTarget.dataset.number}` }) },
  openSearch() { wx.navigateTo({ url: '/pages/search/search?scope=lecture' }) }
})
