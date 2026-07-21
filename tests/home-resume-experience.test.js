const assert = require('assert')
const fs = require('fs')
const path = require('path')

const memory = new Map()
const navigations = []
global.wx = {
  getStorageSync(key) { return memory.get(key) },
  setStorageSync(key, value) { memory.set(key, JSON.parse(JSON.stringify(value))) },
  navigateTo(options) { navigations.push(options.url) },
  switchTab() {}
}

let page
global.Page = definition => { page = definition }

const root = path.resolve(__dirname, '..')
const wxml = fs.readFileSync(path.join(root, 'miniprogram/pages/home/home.wxml'), 'utf8')
const content = require('../miniprogram/data/content')
const store = require('../miniprogram/utils/store')
require('../miniprogram/pages/home/home')

function context() {
  return Object.assign({}, page, {
    data: JSON.parse(JSON.stringify(page.data)),
    setData(update) { Object.assign(this.data, update) }
  })
}

store.reset()
const older = store.startSession(content.courses[0].id, false)
const latest = store.startSession(content.courses[1].id, false)
store.update(state => {
  const oldSession = state.sessions.find(item => item.id === older.id)
  const latestSession = state.sessions.find(item => item.id === latest.id)
  oldSession.lastVisitedAt = 100
  oldSession.status = 'active'
  latestSession.lastVisitedAt = 200
  latestSession.status = 'paused'
  latestSession.currentStep = 4
  state.activeSessionId = oldSession.id
})

let ctx = context()
ctx.onShow()
assert.strictEqual(ctx.data.active.id, latest.id, '首页必须选择最近离开的未完成课程')
assert.strictEqual(ctx.data.active.stepLabel, '背诵练习', '首页必须显示上次离开时的具体步骤')
assert.ok(wxml.includes('当前环节：{{active.stepLabel}}'), '右上角必须明确说明这里显示的是当前环节')
assert.ok(!wxml.includes('class="tag">{{active.stepLabel}}'), '当前环节必须使用非按钮式的状态样式')
assert.ok(wxml.includes('{{active.course.units[0].text}}'), '上次学习卡片的小标题必须使用本课第一句原文')
ctx.continueLearning()
assert.strictEqual(navigations.pop(), `/pages/learn/learn?sessionId=${latest.id}`, '继续学习必须恢复最近离开的学习轮次')

store.reset()
ctx = context()
ctx.onShow()
assert.strictEqual(ctx.data.active, null, '没有未完成课程时不应显示继续学习')
assert.strictEqual(ctx.data.next.id, content.courses[0].id, '没有未完成课程时应推荐顺序中的下一课')
assert.ok(wxml.includes('今日课程'), '没有未完成课程时卡片应标记为今日课程')

store.update(state => {
  state.lastVisited = { type: 'course', id: content.courses[1].id, title: '旧标题', at: 300 }
})
ctx.onShow()
assert.strictEqual(ctx.data.recentReading, null, '课程浏览记录不应生成与上次学习重复的最近位置卡片')

store.update(state => {
  state.lectureStates[3] = { status: 'reading', paragraphIndex: 4, updatedAt: 100 }
  state.lectureStates[8] = { status: 'reading', paragraphIndex: 11, updatedAt: 200 }
})
ctx.onShow()
assert.strictEqual(ctx.data.recentReading.id, 8, '最近阅读必须选择最后读过的讲稿')
assert.strictEqual(ctx.data.recentReading.title, '《细讲弟子规》第 8 讲', '最近阅读必须明确显示讲次')
assert.strictEqual(ctx.data.recentReading.subtitle, '上次读到第 12 段', '最近阅读必须显示上次段落位置')
ctx.openRecent()
assert.strictEqual(navigations.pop(), '/pages/lecture-reader/lecture-reader?number=8&paragraphIndex=11', '最近阅读必须恢复对应讲次和段落')
assert.ok(wxml.includes('最近阅读'), '首页必须将最近位置改成讲稿最近阅读')
assert.ok(!wxml.includes('最近位置'), '首页不应再展示含义重复的最近位置')

const focusIndex = wxml.indexOf('focus-card')
const reviewIndex = wxml.indexOf('card-pink priority')
const readingIndex = wxml.indexOf('最近阅读')
const progressIndex = wxml.indexOf('总体记录')
assert.ok(focusIndex < reviewIndex && reviewIndex < readingIndex && readingIndex < progressIndex, '首页行动顺序必须是继续学习、到期复习、最近阅读、总体记录')

console.log(JSON.stringify({ passed: true, resumed: latest.id, fallback: content.courses[0].id }))
