const assert = require('assert')
const fs = require('fs')
const path = require('path')

const memory = new Map()
global.wx = {
  getStorageSync(key) { return memory.get(key) },
  setStorageSync(key, value) { memory.set(key, JSON.parse(JSON.stringify(value))) },
  showToast() {},
  showModal() {},
  navigateTo() {},
  navigateBack() {},
  switchTab() {}
}

let page
global.Page = definition => { page = definition }

const root = path.resolve(__dirname, '..')
const wxml = fs.readFileSync(path.join(root, 'miniprogram/pages/learn/learn.wxml'), 'utf8')
require('../miniprogram/pages/learn/learn')
const content = require('../miniprogram/data/content')
const store = require('../miniprogram/utils/store')

assert.ok(page, '学习页必须注册 Page')
const handlers = Array.from(wxml.matchAll(/bind(?:tap|input|submit)="([^"]+)"/g), match => match[1])
handlers.forEach(handler => assert.strictEqual(typeof page[handler], 'function', `学习页缺少事件处理函数 ${handler}`))

function buttonHandler(label) {
  const buttons = Array.from(wxml.matchAll(/<button[^>]+bindtap="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g))
  const match = buttons.find(item => item[2].replace(/<[^>]+>/g, '').replace(/[“”]/g, '').includes(label))
  assert.ok(match, `找不到按钮：${label}`)
  return match[1]
}

function context(sessionId, data) {
  return Object.assign({}, page, {
    sessionId,
    data: Object.assign({}, page.data, data),
    setData(update, callback) { Object.assign(this.data, update); if (callback) callback() }
  })
}

store.reset()
let course = content.courses[0]
let session = store.startSession(course.id, false)
let ctx = context(session.id, { course, session, step: 1, reciteUnit: null, reveal: 'hidden' })
ctx.selectStep({ currentTarget: { dataset: { step: 4 } } })
assert.strictEqual(store.getSession(session.id).currentStep, 4, '点击背诵练习后必须切换到第 4 步')
assert.strictEqual(ctx.data.step, 4, '点击背诵练习后页面必须立即显示第 4 步')
assert.ok(ctx.data.reciteUnit, '进入背诵练习后必须加载首个原文单元')

store.reset()
course = content.courses[0]
session = store.startSession(course.id, false)
ctx = context(session.id, { course, session, step: 4, reciteUnit: null, reciteRated: false, reveal: 'full' })
ctx.prepareStep(4)
assert.strictEqual(ctx.data.reciteOverview.length, course.units.length, '背诵环节必须覆盖本课全部原文单元')
assert.deepStrictEqual(ctx.data.reciteOverview.map(item => item.id), course.units.map(item => item.id), '背诵全文顺序必须与课程原文一致')
assert.ok(ctx.data.reciteOverview.every(item => !Object.prototype.hasOwnProperty.call(item, 'text')), '背诵进度不能提前携带或展示原文')
course.units.forEach((unit, index) => {
  assert.strictEqual(ctx.data.reciteUnit.id, unit.id, `第 ${index + 1} 句必须按顺序进入背诵`)
  assert.strictEqual(ctx.data.nextReciteLabel, index === course.units.length - 1 ? '完成背诵，进入理解反思 →' : '下一句 →')
  ctx.nextRecite()
})
assert.strictEqual(store.getSession(session.id).recitedUnitIds.length, course.units.length, '本课全部原文都必须完成背诵记录')
assert.strictEqual(store.getState().ratingEvents.length, 0, '逐句背诵完成不能伪造待复习、模糊或熟练评级')
assert.ok(store.getSession(session.id).completedSteps.includes(4), '最后一句后必须完成背诵步骤')
assert.strictEqual(store.getSession(session.id).currentStep, 5, '背诵完成后必须直接进入理解反思')
assert.strictEqual(ctx.data.step, 5, '背诵完成后页面必须显示理解反思')

store.reset()
course = content.courses[0]
session = store.startSession(course.id, false)
for (let step = 1; step <= 3; step += 1) store.completeStep(session.id, step)
store.setCurrentStep(session.id, 5)
session = store.getSession(session.id)
ctx = context(session.id, { course, session, step: 5, reflection: '今天理解了及时回应与独立判断。', thoughtOnly: false })
page[buttonHandler('保存并完成本步')].call(ctx)
assert.ok(store.getSession(session.id).completedSteps.includes(5), '保存反思后必须完成第 5 步')
assert.ok(store.getState().reflections.some(item => item.sessionId === session.id && item.text), '保存反思后必须写入文字记录')
assert.strictEqual(store.getSession(session.id).currentStep, 4, '第 4 步未完成时，保存反思后应回到第 4 步并给出可见反馈')

session = store.startSession(content.courses[1].id, false)
for (let step = 1; step <= 3; step += 1) store.completeStep(session.id, step)
store.setCurrentStep(session.id, 5)
session = store.getSession(session.id)
ctx = context(session.id, { course: content.courses[1], session, step: 5, reflection: '', thoughtOnly: false })
page[buttonHandler('不写文字，仅标记已思考')].call(ctx)
assert.ok(store.getSession(session.id).completedSteps.includes(5), '仅标记已思考后必须完成第 5 步')
assert.ok(store.getState().reflections.some(item => item.sessionId === session.id && item.thoughtOnly), '仅标记已思考必须写入思考记录')
assert.strictEqual(store.getSession(session.id).currentStep, 4, '第 4 步未完成时，仅标记已思考后应回到第 4 步')

assert.ok(!/来源：公开学习资料整理版/.test(wxml), '学习原文中不应显示来源')
assert.ok(!/第 \{\{item\.sourceLine\}\} 行/.test(wxml), '学习原文中不应显示来源行号')
assert.ok(!/comparison-alert|class="proposal/.test(wxml), '基础译文下方不应再显示其他内容')
assert.ok(!/highlightParagraphs/.test(wxml), '课程讲解不应显示片段匹配')
assert.ok(/course\.relatedLectures/.test(wxml), '课程讲解应保留相关讲次')
assert.ok(/bindtap="nextRecite"/.test(wxml), '背诵练习必须提供下一单元按钮')
assert.ok(/reciteOverview/.test(wxml), '背诵练习必须展示覆盖整课的练习进度')
const step4Wxml = wxml.match(/<block wx:elif="\{\{step === 4\}\}">([\s\S]*?)<block wx:elif="\{\{step === 5\}\}">/)[1]
assert.ok(!/\{\{item\.text\}\}|overview-text/.test(step4Wxml), '背诵进度区不能直接展示整课原文')
assert.ok(/\{\{reciteUnit\.text\}\}/.test(step4Wxml), '只有用户主动对照时才能显示当前句原文')
assert.ok(!/待复习|模糊|熟练/.test(step4Wxml), '背诵练习中不能显示熟练度评级')
assert.ok(!/reciteUnit\.id/.test(wxml), '背诵练习不应显示 DZG 单元 ID')
assert.ok(!/completedSteps\.length\}\} \/ 5/.test(wxml), '学习页右上角不应显示步骤数字标')
assert.ok(!/recitedUnitIds\.length \+ 1\}\} \/ \{\{session\.requiredUnitIds\.length/.test(wxml), '背诵练习不应显示单元数字标')

console.log(JSON.stringify({ passed: true, handlers: handlers.length }))
