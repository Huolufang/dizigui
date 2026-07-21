const { getCourse, getUnit } = require('../../data/content')
const store = require('../../utils/store')

const STEP_TITLES = ['复习旧课', '学习原文', '课程讲解', '背诵练习', '理解反思']

function buildReciteOverview(course, session, currentId) {
  return course.units.map(unit => ({
    id: unit.id,
    done: session.recitedUnitIds.includes(unit.id),
    current: unit.id === currentId,
    stateLabel: session.recitedUnitIds.includes(unit.id) ? '已练习' : unit.id === currentId ? '正在练习' : '待练习'
  }))
}

Page({
  data: { session: null, course: null, step: 1, stepTitles: STEP_TITLES, stepNav: [], step2Label: '', step3Label: '', reviewUnits: [], currentReview: null, reciteOverview: [], reciteUnit: null, nextReciteLabel: '', reveal: 'hidden', reflection: '', thoughtOnly: false },
  onLoad(options) { this.sessionId = options.sessionId; this.load() },
  onUnload() { if (this.saveTimer) clearTimeout(this.saveTimer); this.flushReflection(); store.touchSession(this.sessionId) },
  load() {
    const session = store.getSession(this.sessionId)
    if (!session) { wx.showModal({ title: '学习轮次无法打开', content: '记录已不存在或引用失效，请返回课程页重新开始。', showCancel: false, success: () => wx.navigateBack() }); return }
    const course = getCourse(session.courseId)
    const state = store.getState()
    const reflection = state.reflections.find(item => item.id === session.reflectionId)
    state.lastVisited = { type: 'course', id: course.id, title: course.chapter, subtitle: course.units[0].text, at: Date.now() }
    store.saveState(state)
    const stepNav = STEP_TITLES.map((title, index) => ({ number: index + 1, numberLabel: `0${index + 1}`, title, active: session.currentStep === index + 1, done: session.completedSteps.includes(index + 1) }))
    this.setData({ session, course, step: session.currentStep, stepNav, step2Label: session.completedSteps.includes(2) ? '本步已完成' : '我已完成原文学习', step3Label: session.completedSteps.includes(3) ? '本步已完成' : '我已完成讲解阅读', reflection: reflection ? reflection.text : '', thoughtOnly: reflection ? reflection.thoughtOnly : false })
    this.prepareStep(session.currentStep)
  },
  selectStep(event) {
    const step = Number(event.currentTarget.dataset.step)
    store.setCurrentStep(this.sessionId, step)
    this.setData({ reveal: 'hidden' })
    this.load()
  },
  prepareStep(step) {
    const session = store.getSession(this.sessionId)
    if (step === 1) {
      const snapshot = store.ensureReviewSnapshot(this.sessionId)
      const reviewUnits = snapshot.unitIds.map(id => {
        const unit = getUnit(id)
        return Object.assign({}, unit, { hint: `${unit.text.slice(0, 4)}……`, done: snapshot.completedUnitIds.includes(id) })
      })
      this.setData({ session: store.getSession(this.sessionId), reviewUnits, currentReview: reviewUnits.find(item => !item.done) || null })
    }
    if (step === 4) {
      const course = this.data.course
      const source = course.units.find(item => !session.recitedUnitIds.includes(item.id)) || null
      const reciteUnit = source ? Object.assign({}, source, { hint: `${source.text.slice(0, 4)}……` }) : null
      const remaining = course.units.filter(item => !session.recitedUnitIds.includes(item.id)).length
      this.setData({ session, reciteOverview: buildReciteOverview(course, session, source ? source.id : ''), reciteUnit, nextReciteLabel: remaining === 1 ? '完成背诵，进入理解反思 →' : '下一句 →' })
    }
  },
  setReveal(event) { this.setData({ reveal: event.currentTarget.dataset.mode }) },
  rateReview(event) {
    store.rateUnit(this.data.currentReview.id, event.currentTarget.dataset.rating, 'old-review', this.sessionId)
    this.setData({ reveal: 'hidden' })
    this.prepareStep(1)
  },
  skipReview() {
    store.update(state => { const session = state.sessions.find(item => item.id === this.sessionId); if (session && session.reviewSnapshot) session.reviewSnapshot.skipped = true })
    this.complete(1)
  },
  finishReview() { this.complete(1) },
  nextRecite() {
    if (!this.data.reciteUnit) return
    store.completeReciteUnit(this.sessionId, this.data.reciteUnit.id)
    const session = store.getSession(this.sessionId)
    if (session.recitedUnitIds.length === session.requiredUnitIds.length) {
      this.complete(4)
      return
    }
    this.setData({ reveal: 'hidden', nextReciteLabel: '' })
    this.prepareStep(4)
  },
  completeCurrent() { this.complete(this.data.step) },
  complete(step) {
    store.completeStep(this.sessionId, Number(step))
    const session = store.getSession(this.sessionId)
    if (session && session.status === 'completed') {
      wx.showModal({ title: '本轮学习已完成', content: '五个学习动作已全部记录。这是完成事实，不作为理解或能力评分。', showCancel: false, success: () => wx.navigateBack() })
      return
    }
    if (Number(step) === 5) {
      const firstIncomplete = [1, 2, 3, 4].find(item => !session.completedSteps.includes(item))
      if (firstIncomplete) {
        store.setCurrentStep(this.sessionId, firstIncomplete)
        wx.showToast({ title: `反思已保存，继续第 ${firstIncomplete} 步`, icon: 'none' })
      }
    }
    this.load()
  },
  openLecture(event) {
    const data = event.currentTarget.dataset
    const anchor = data.paragraph !== undefined ? `&paragraphIndex=${data.paragraph}` : ''
    wx.navigateTo({ url: `/pages/lecture-reader/lecture-reader?number=${data.number}${anchor}` })
  },
  onReflectionInput(event) {
    this.setData({ reflection: event.detail.value, thoughtOnly: false })
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => this.flushReflection(), 350)
  },
  flushReflection() {
    if (!this.sessionId || this.data.step !== 5) return
    store.saveReflection(this.sessionId, this.data.course.id, this.data.reflection, this.data.thoughtOnly)
  },
  finishReflection() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    store.saveReflection(this.sessionId, this.data.course.id, this.data.reflection, false)
    this.complete(5)
  },
  thoughtOnly() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.setData({ reflection: '', thoughtOnly: true })
    store.saveReflection(this.sessionId, this.data.course.id, '', true)
    this.complete(5)
  }
})
