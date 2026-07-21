const { courses, units, lectures, CONTENT_VERSION } = require('../data/content')
const { today, addDays } = require('./date')

const KEY = 'dizigui_learning_state_v2'
const ROLLBACK_KEY = 'dizigui_learning_state_v2_rollback'
const STATE_VERSION = '2.0'
const BACKUP_VERSION = '2.0'

const DEFAULT_STATE = {
  stateVersion: STATE_VERSION,
  activeSessionId: '',
  sessions: [],
  ratingEvents: [],
  reflections: [],
  lectureStates: {},
  readingPositions: {},
  recentSearches: [],
  settings: { fontSize: 'medium' },
  lastVisited: null,
  updatedAt: 0,
  quarantined: []
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}` }
function merge(raw) {
  return Object.assign(clone(DEFAULT_STATE), raw || {}, {
    sessions: Array.isArray(raw && raw.sessions) ? raw.sessions : [],
    ratingEvents: Array.isArray(raw && raw.ratingEvents) ? raw.ratingEvents : [],
    reflections: Array.isArray(raw && raw.reflections) ? raw.reflections : [],
    lectureStates: Object.assign({}, raw && raw.lectureStates),
    readingPositions: Object.assign({}, raw && raw.readingPositions),
    recentSearches: Array.isArray(raw && raw.recentSearches) ? raw.recentSearches : [],
    settings: Object.assign({}, DEFAULT_STATE.settings, raw && raw.settings)
  })
}
function ensureState() {
  let raw
  try { raw = wx.getStorageSync(KEY) } catch (error) { raw = null }
  const state = merge(raw)
  if (!raw) saveState(state)
  return state
}
function getState() { return ensureState() }
function saveState(state) {
  const next = merge(state)
  next.updatedAt = Date.now()
  try {
    wx.setStorageSync(KEY, next)
    return next
  } catch (error) {
    wx.showModal({
      title: '本次操作尚未保存',
      content: '本机存储写入失败，上一份有效记录仍然保留。请清理微信存储空间后重试，或先到“我的”导出诊断备份。',
      showCancel: false
    })
    return state
  }
}
function update(mutator) {
  const state = getState()
  const result = mutator(state) || state
  return saveState(result)
}
function courseSessions(state, courseId) { return state.sessions.filter(item => item.courseId === courseId) }
function courseStatus(state, courseId) {
  const list = courseSessions(state, courseId)
  if (list.some(item => item.status === 'completed')) return 'completed'
  if (list.some(item => item.status === 'active' || item.status === 'paused')) return 'learning'
  return 'new'
}
function currentSession(state) { return state.sessions.find(item => item.id === state.activeSessionId) || null }
function latestUnfinishedSession(stateInput) {
  const state = stateInput || getState()
  return state.sessions.filter(item => item.status !== 'completed').sort((a, b) => b.lastVisitedAt - a.lastVisitedAt || b.startedAt - a.startedAt)[0] || null
}
function touchSession(sessionId) {
  return update(state => {
    const session = state.sessions.find(item => item.id === sessionId)
    if (!session || session.status === 'completed') return
    state.sessions.forEach(item => { if (item.id !== session.id && item.status === 'active') item.status = 'paused' })
    session.status = 'active'
    session.lastVisitedAt = Date.now()
    state.activeSessionId = session.id
  })
}
function startSession(courseId, relearn) {
  let selected
  update(state => {
    const existing = state.sessions.find(item => item.courseId === courseId && item.status !== 'completed')
    if (existing) selected = existing
    else {
      const course = courses.find(item => item.id === courseId)
      selected = {
        id: uid('ROUND'), courseId, type: relearn ? 'relearn' : 'first', status: 'active',
        completedSteps: [], currentStep: 1, startedAt: Date.now(), lastVisitedAt: Date.now(), completedAt: 0,
        reviewSnapshot: null, recitedUnitIds: [], reflectionId: '', requiredUnitIds: course.units.map(item => item.id)
      }
      state.sessions.push(selected)
    }
    state.sessions.forEach(item => {
      if (item.id !== selected.id && item.status === 'active') item.status = 'paused'
    })
    selected.status = 'active'
    selected.lastVisitedAt = Date.now()
    state.activeSessionId = selected.id
  })
  return selected
}
function getSession(id) { return getState().sessions.find(item => item.id === id) || null }
function ensureReviewSnapshot(sessionId) {
  let snapshot
  update(state => {
    const session = state.sessions.find(item => item.id === sessionId)
    if (!session) return
    if (!session.reviewSnapshot) {
      const latest = latestRatings(state)
      const candidates = units.filter(unit => unit.courseId !== session.courseId && latest[unit.id] && latest[unit.id].dueDate <= today())
        .sort((a, b) => latest[a.id].dueDate.localeCompare(latest[b.id].dueDate) || latest[a.id].ratedAt - latest[b.id].ratedAt || a.courseOrder - b.courseOrder || a.order - b.order || a.id.localeCompare(b.id))
        .slice(0, 3)
      session.reviewSnapshot = { generatedAt: Date.now(), unitIds: candidates.map(item => item.id), completedUnitIds: [], skipped: false }
    }
    snapshot = session.reviewSnapshot
  })
  return snapshot
}
function completeStep(sessionId, step) {
  return update(state => {
    const session = state.sessions.find(item => item.id === sessionId)
    if (!session) return
    if (!session.completedSteps.includes(step)) session.completedSteps.push(step)
    session.currentStep = Math.min(5, Number(step) + 1)
    session.lastVisitedAt = Date.now()
    if (session.completedSteps.length === 5) {
      session.status = 'completed'
      session.completedAt = Date.now()
      if (state.activeSessionId === session.id) state.activeSessionId = ''
    }
  })
}
function setCurrentStep(sessionId, step) {
  return update(state => {
    const session = state.sessions.find(item => item.id === sessionId)
    if (session) { session.currentStep = Number(step); session.lastVisitedAt = Date.now() }
  })
}
function rateUnit(unitId, rating, sourceType, sessionId) {
  const interval = { review: 1, fuzzy: 3, fluent: 7 }[rating]
  const event = {
    id: uid('RATE'), unitId, rating, ratedAt: Date.now(), localDate: today(),
    dueDate: addDays(today(), interval), sourceType, sessionId: sessionId || '', step: sourceType === 'course' ? 4 : null
  }
  update(state => {
    state.ratingEvents.push(event)
    if (sessionId) {
      const session = state.sessions.find(item => item.id === sessionId)
      if (session && sourceType === 'course' && !session.recitedUnitIds.includes(unitId)) session.recitedUnitIds.push(unitId)
      if (session && sourceType === 'old-review' && session.reviewSnapshot && !session.reviewSnapshot.completedUnitIds.includes(unitId)) session.reviewSnapshot.completedUnitIds.push(unitId)
    }
  })
  return event
}
function completeReciteUnit(sessionId, unitId) {
  return update(state => {
    const session = state.sessions.find(item => item.id === sessionId)
    if (!session || !session.requiredUnitIds.includes(unitId)) return
    if (!session.recitedUnitIds.includes(unitId)) session.recitedUnitIds.push(unitId)
    session.lastVisitedAt = Date.now()
  })
}
function latestRatings(stateInput) {
  const state = stateInput || getState()
  return state.ratingEvents.reduce((result, event) => {
    if (!result[event.unitId] || result[event.unitId].ratedAt <= event.ratedAt) result[event.unitId] = event
    return result
  }, {})
}
function dueUnits(stateInput) {
  const latest = latestRatings(stateInput)
  return units.filter(item => latest[item.id] && latest[item.id].dueDate <= today())
    .sort((a, b) => latest[a.id].dueDate.localeCompare(latest[b.id].dueDate) || a.courseOrder - b.courseOrder || a.order - b.order)
    .map(item => Object.assign({}, item, { latest: latest[item.id] }))
}
function saveReflection(sessionId, courseId, text, thoughtOnly) {
  let reflection
  update(state => {
    const session = state.sessions.find(item => item.id === sessionId)
    reflection = session && state.reflections.find(item => item.id === session.reflectionId)
    if (reflection) {
      reflection.text = text || ''
      reflection.thoughtOnly = Boolean(thoughtOnly)
      reflection.updatedAt = Date.now()
    } else {
      reflection = { id: uid('NOTE'), sessionId, courseId, text: text || '', thoughtOnly: Boolean(thoughtOnly), createdAt: Date.now(), updatedAt: Date.now() }
      state.reflections.push(reflection)
      if (session) session.reflectionId = reflection.id
    }
  })
  return reflection
}
function saveLectureState(number, patch) {
  return update(state => {
    const current = state.lectureStates[number] || { status: 'unread', paragraphIndex: 0, offset: 0 }
    state.lectureStates[number] = Object.assign({}, current, patch, { updatedAt: Date.now() })
  })
}
function addSearch(term) {
  if (!term) return
  update(state => { state.recentSearches = [term].concat(state.recentSearches.filter(item => item !== term)).slice(0, 10) })
}
function exportPayload() {
  return {
    backupVersion: BACKUP_VERSION,
    stateVersion: STATE_VERSION,
    contentVersion: CONTENT_VERSION,
    exportedAt: new Date().toISOString(),
    state: getState()
  }
}
function validatePayload(payload) {
  if (!payload || !payload.state || payload.backupVersion !== BACKUP_VERSION || payload.stateVersion !== STATE_VERSION) throw new Error('备份格式或学习状态版本不兼容，请使用 2.0 版导出的备份。')
  const validCourseIds = new Set(courses.map(item => item.id))
  const validUnitIds = new Set(units.map(item => item.id))
  const validLectureIds = new Set(lectures.map(item => String(item.number)))
  const invalidSession = (payload.state.sessions || []).find(item => !validCourseIds.has(item.courseId))
  const invalidRating = (payload.state.ratingEvents || []).find(item => !validUnitIds.has(item.unitId))
  const invalidLecture = Object.keys(payload.state.lectureStates || {}).find(id => !validLectureIds.has(String(id)))
  if (invalidSession || invalidRating || invalidLecture) throw new Error('备份含有当前内容版本无法解析的必要引用，未改动现有学习记录。')
  return merge(payload.state)
}
function restorePayload(payload) {
  const next = validatePayload(payload)
  const current = getState()
  wx.setStorageSync(ROLLBACK_KEY, current)
  try {
    wx.setStorageSync(KEY, next)
    const reread = wx.getStorageSync(KEY)
    if (!reread || reread.stateVersion !== STATE_VERSION) throw new Error('写入后校验失败')
    return reread
  } catch (error) {
    wx.setStorageSync(KEY, current)
    throw error
  }
}
function reset() { wx.setStorageSync(KEY, clone(DEFAULT_STATE)); return getState() }

module.exports = {
  KEY, STATE_VERSION, BACKUP_VERSION, ensureState, getState, saveState, update, courseStatus,
  currentSession, latestUnfinishedSession, touchSession, startSession, getSession, ensureReviewSnapshot, completeStep, setCurrentStep,
  rateUnit, completeReciteUnit, latestRatings, dueUnits, saveReflection, saveLectureState, addSearch,
  exportPayload, validatePayload, restorePayload, reset
}
