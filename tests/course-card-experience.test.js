const assert = require('assert')
const fs = require('fs')
const path = require('path')

const memory = new Map()
const navigations = []
global.wx = {
  getStorageSync(key) { return memory.get(key) },
  setStorageSync(key, value) { memory.set(key, JSON.parse(JSON.stringify(value))) },
  navigateTo(options) { navigations.push(options.url) },
  showModal() {},
  pageScrollTo() {}
}

let page
global.Page = definition => { page = definition }

const root = path.resolve(__dirname, '..')
const coursesWxml = fs.readFileSync(path.join(root, 'miniprogram/pages/courses/courses.wxml'), 'utf8')
const homeWxml = fs.readFileSync(path.join(root, 'miniprogram/pages/home/home.wxml'), 'utf8')
const detailWxml = fs.readFileSync(path.join(root, 'miniprogram/pages/course-detail/course-detail.wxml'), 'utf8')
const content = require('../miniprogram/data/content')
const store = require('../miniprogram/utils/store')
require('../miniprogram/pages/course-detail/course-detail')

assert.ok(content.courses.some(course => course.chapter.includes('出则悌')), '课程框架必须使用“出则悌”')
assert.ok(content.courses.every(course => !course.chapter.includes('出则弟')), '课程框架不能再使用“出则弟”')
assert.ok(/class="h1[^\"]*"[^>]*>\{\{item\.chapter\}\}/.test(coursesWxml), '课程列表卡片必须以篇章框架作为大标题')
assert.ok(/course-summary[^>]*>\{\{item\.title\}\}/.test(coursesWxml), '课程列表必须把现代语总结降为副标题')
assert.ok(/class="h1[^\"]*"[^>]*>\{\{active\.course\.chapter\}\}/.test(homeWxml), '首页继续学习卡片必须以篇章框架作为大标题')
assert.ok(/class="h1[^\"]*"[^>]*>\{\{next\.chapter\}\}/.test(homeWxml), '首页下一课卡片必须以篇章框架作为大标题')
assert.ok(/class="display"[^>]*>\{\{course\.chapter\}\}/.test(detailWxml), '课程详情封面必须以篇章框架作为大标题')
assert.ok(/data-step="4"[^>]*bindtap="openStep"/.test(detailWxml), '课程详情中的背诵练习必须是可点击入口')
assert.strictEqual(typeof page.openStep, 'function', '课程详情页必须实现步骤入口处理函数')

store.reset()
const course = content.courses[0]
const ctx = Object.assign({}, page, {
  courseId: course.id,
  data: Object.assign({}, page.data, { course, status: 'new', session: null }),
  setData(update, callback) { Object.assign(this.data, update); if (callback) callback() }
})
ctx.openStep({ currentTarget: { dataset: { step: 4 } } })
const session = store.currentSession(store.getState())
assert.ok(session, '点击背诵练习后必须创建学习轮次')
assert.strictEqual(session.currentStep, 4, '点击背诵练习后必须进入第 4 步')
assert.ok(navigations.some(url => url === `/pages/learn/learn?sessionId=${session.id}`), '点击背诵练习后必须打开学习页')

console.log(JSON.stringify({ passed: true, course: course.id, step: session.currentStep }))
