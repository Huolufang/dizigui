const { units } = require('../../data/content')
const store = require('../../utils/store')
const { today, addDays } = require('../../utils/date')

Page({
  data: { tab: 'due', due: [], upcoming: [], all: [], current: null, reveal: 'hidden' },
  onShow() { this.refresh() },
  refresh() {
    const state = store.getState()
    const latest = store.latestRatings(state)
    const due = store.dueUnits(state)
    const nextWeek = addDays(today(), 7)
    const upcoming = units.filter(item => latest[item.id] && latest[item.id].dueDate > today() && latest[item.id].dueDate <= nextWeek)
      .map(item => Object.assign({}, item, { latest: latest[item.id] }))
      .sort((a, b) => a.latest.dueDate.localeCompare(b.latest.dueDate))
    const all = units.map(item => Object.assign({}, item, { hint: `${item.text.slice(0, 4)}……`, latest: latest[item.id] || null, ratingLabel: latest[item.id] ? ({ fluent: '熟练', fuzzy: '模糊', review: '待复习' }[latest[item.id].rating]) : '尚未评级' }))
    due.forEach(item => { item.hint = `${item.text.slice(0, 4)}……` })
    upcoming.forEach(item => { item.hint = `${item.text.slice(0, 4)}……` })
    this.setData({ due, upcoming, all })
  },
  switchTab(event) { this.setData({ tab: event.currentTarget.dataset.tab, current: null, reveal: 'hidden' }) },
  practice(event) {
    const id = event.currentTarget.dataset.id
    const source = units.find(unit => unit.id === id)
    const item = Object.assign({}, source, { hint: `${source.text.slice(0, 4)}……` })
    this.setData({ current: item, reveal: 'hidden' })
  },
  setReveal(event) { this.setData({ reveal: event.currentTarget.dataset.mode }) },
  rate(event) {
    if (!this.data.current) return
    store.rateUnit(this.data.current.id, event.currentTarget.dataset.rating, 'free-practice', '')
    wx.showToast({ title: '排期已更新', icon: 'success' })
    this.setData({ current: null, reveal: 'hidden' })
    this.refresh()
  }
})
