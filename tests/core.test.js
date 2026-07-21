const assert = require('assert')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const memory = new Map()
global.wx = {
  getStorageSync(key) { return memory.get(key) },
  setStorageSync(key, value) { memory.set(key, JSON.parse(JSON.stringify(value))) },
  showModal() {},
  showToast() {}
}

const content = require('../miniprogram/data/content')
const store = require('../miniprogram/utils/store')
const searchEngine = require('../miniprogram/utils/search')
const semanticProposals = require('../content/review/semantic-proposals.json')

assert.strictEqual(content.courses.length, 18)
assert.strictEqual(content.units.length, 90)
assert.strictEqual(content.lectures.length, 40)
assert.strictEqual(content.lectures.reduce((sum, item) => sum + item.paragraphs.length, 0), 1477)
assert.ok(content.units.every(item => item.annotation && item.translation && item.sourceLine))
assert.ok(content.units.every(item => content.getParagraphById(item.primaryCandidateParagraphId)))
assert.ok(content.courses.every(item => item.candidateHighlightChars >= 1200 && item.candidateHighlightChars <= 2200))
assert.ok(content.courses.every(item => item.reviewStatus === 'confirmed'))
assert.ok(content.units.every(item => item.ownerConfirmed))
assert.deepStrictEqual(content.units.reduce((counts, item) => { counts[item.comparisonStatus] = (counts[item.comparisonStatus] || 0) + 1; return counts }, {}), { 'no-difference': 74, difference: 13, 'not-applicable': 3 })
assert.strictEqual(content.getUnit('DZG-CD-010').text, '进必趋，退必迟；问起对，视勿移。')
assert.strictEqual(content.getUnit('DZG-JIN-017').text, '借人物，及时还；后有急，借不难。')
assert.ok(content.getCourse('COURSE-02').relatedLectures.includes(12))
assert.deepStrictEqual(content.units.filter(item => item.variantDecision).map(item => item.id), ['DZG-CD-010', 'DZG-JIN-017'])
assert.strictEqual(semanticProposals.proposals.length, 90)
assert.strictEqual(new Set(semanticProposals.proposals.map(item => item.unitId)).size, 90)
assert.deepStrictEqual(new Set(semanticProposals.proposals.map(item => item.unitId)), new Set(content.units.map(item => item.id)))
const proposalCounts = semanticProposals.proposals.reduce((counts, item) => { counts[item.proposedStatus] = (counts[item.proposedStatus] || 0) + 1; return counts }, {})
assert.deepStrictEqual(proposalCounts, { 'no-difference': 73, difference: 13, 'needs-better-paragraph': 4 })
assert.ok(content.units.every(item => item.supplementalParagraphIds.every(id => content.getParagraphById(id))))
const sources = require('../content/raw/sources.json')
const canonicalSource = sources.sources.find(item => item.id === 'SRC-CANONICAL')
const canonicalPath = path.join(__dirname, '..', 'content/raw/dizigui-original.md')
const canonicalBuffer = fs.readFileSync(canonicalPath)
assert.strictEqual(canonicalSource.bytes, canonicalBuffer.length)
assert.strictEqual(canonicalSource.sha256, crypto.createHash('sha256').update(canonicalBuffer).digest('hex'))

store.reset()
const first = store.startSession(content.courses[0].id, false)
assert.strictEqual(store.currentSession(store.getState()).id, first.id)
const snapshot = store.ensureReviewSnapshot(first.id)
assert.deepStrictEqual(snapshot.unitIds, [])
for (let step = 1; step <= 3; step += 1) store.completeStep(first.id, step)
for (const unit of content.courses[0].units) store.rateUnit(unit.id, 'fluent', 'course', first.id)
assert.strictEqual(store.getSession(first.id).recitedUnitIds.length, content.courses[0].units.length)
store.completeStep(first.id, 4)
store.saveReflection(first.id, content.courses[0].id, '这是一条测试反思。', false)
store.completeStep(first.id, 5)
assert.strictEqual(store.getSession(first.id).status, 'completed')
assert.strictEqual(store.courseStatus(store.getState(), content.courses[0].id), 'completed')
assert.ok(store.latestRatings()[content.courses[0].units[0].id].dueDate)

const second = store.startSession(content.courses[1].id, false)
const third = store.startSession(content.courses[2].id, false)
assert.strictEqual(store.getSession(second.id).status, 'paused')
assert.strictEqual(store.getSession(third.id).status, 'active')

const backup = store.exportPayload()
const serialized = JSON.stringify(backup)
assert.ok(!serialized.includes(content.lectures[0].paragraphs[0]))
assert.ok(!Object.prototype.hasOwnProperty.call(backup, 'courses'))
const before = store.getState().sessions.length
store.restorePayload(JSON.parse(serialized))
assert.strictEqual(store.getState().sessions.length, before)
assert.throws(() => store.validatePayload(Object.assign({}, backup, { backupVersion: '3.0' })))

const fixedQueries = [
  ['父母呼', 'originals'], ['出必告', 'originals'], ['凡是人', 'originals'], ['勿畏难', 'originals'], ['学文', 'originals'],
  ['幸福人生', 'lectures'], ['身教', 'lectures'], ['冬温夏凊', 'lectures'], ['信用', 'lectures'], ['孔融让梨', 'lectures']
]
const timings = fixedQueries.map(([query, group]) => {
  const result = searchEngine.search(query)
  assert.ok(result[group].length > 0, `${query} 应命中 ${group}`)
  return { query, elapsed: result.elapsed, count: result[group].length }
})
console.log(JSON.stringify({ passed: true, timings }, null, 2))
