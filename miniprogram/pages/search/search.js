const { search } = require('../../utils/search')
const store = require('../../utils/store')

function highlight(text, terms) {
  const source = String(text || '')
  if (!terms.length) return [{ text: source, hit: false }]
  const escaped = terms.map(item => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  return source.split(new RegExp(`(${escaped})`, 'gi')).filter(Boolean).map(part => ({ text: part, hit: terms.some(term => part.toLowerCase() === term.toLowerCase()) }))
}

Page({
  data: { query: '', searched: false, results: null, visible: { originals: [], courses: [], lectures: [] }, recent: [], lectureFilter: 0, limits: { originals: 20, courses: 20, lectures: 20 } },
  onLoad(options) { this.setData({ lectureFilter: Number(options.lecture || 0) }); this.refreshRecent() },
  refreshRecent() { this.setData({ recent: store.getState().recentSearches }) },
  onInput(event) { this.setData({ query: event.detail.value }) },
  submit(event) {
    const value = String((event.detail && event.detail.value) || this.data.query || '').trim()
    if (!value) return
    const terms = value.split(/\s+/).filter(Boolean)
    const raw = search(value)
    if (this.data.lectureFilter) raw.lectures = raw.lectures.filter(item => item.lectureNumber === this.data.lectureFilter)
    const results = {}
    ;['originals', 'courses', 'lectures'].forEach(key => { results[key] = raw[key].map(item => Object.assign({}, item, { segments: highlight(item.snippet, terms) })) })
    results.elapsed = raw.elapsed
    results.total = results.originals.length + results.courses.length + results.lectures.length
    store.addSearch(value)
    const limits = { originals: 20, courses: 20, lectures: 20 }
    this.setData({ query: value, searched: true, results, limits, visible: this.visibleResults(results, limits) })
    this.refreshRecent()
  },
  useRecent(event) { this.setData({ query: event.currentTarget.dataset.term }, () => this.submit({ detail: { value: this.data.query } })) },
  deleteRecent(event) { store.update(state => { state.recentSearches = state.recentSearches.filter(item => item !== event.currentTarget.dataset.term) }); this.refreshRecent() },
  clearRecent() { store.update(state => { state.recentSearches = [] }); this.refreshRecent() },
  openResult(event) {
    const item = event.currentTarget.dataset
    if (item.type === 'lecture') wx.navigateTo({ url: `/pages/lecture-reader/lecture-reader?number=${item.lecture}&paragraphIndex=${item.paragraph}` })
    else wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${item.course}${item.unit ? '&unitId=' + item.unit : ''}` })
  },
  visibleResults(results, limits) { return { originals: results.originals.slice(0, limits.originals), courses: results.courses.slice(0, limits.courses), lectures: results.lectures.slice(0, limits.lectures) } },
  more(event) {
    const key = event.currentTarget.dataset.key
    const limits = Object.assign({}, this.data.limits, { [key]: this.data.limits[key] + 20 })
    this.setData({ limits, visible: this.visibleResults(this.data.results, limits) })
  }
})
