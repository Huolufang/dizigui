const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = page => fs.readFileSync(path.join(root, `miniprogram/pages/${page}/${page}.wxml`), 'utf8')

const profile = read('profile')
const home = read('home')
const courses = read('courses')
const lectures = read('lectures')
const review = read('review')

;['个人学习事实', '今天到期', '资料来源与内容状态'].forEach(text => assert.ok(!profile.includes(text), `“我的”页面不应显示：${text}`))
assert.ok(profile.includes('《细讲弟子规》讲稿已读'), '“我的”页面应显示《细讲弟子规》讲稿已读')

;['DI ZI GUI', '系统学习</text>', '完全离线的个人学习工具', '按建议顺序学习'].forEach(text => assert.ok(!home.includes(text), `学习页面不应显示：${text}`))
;['学习路径', '课程按原文篇章'].forEach(text => assert.ok(!courses.includes(text), `课程页面不应显示：${text}`))
;['资料库', '读完整讲稿', '回到原始语境', '蔡礼旭老师'].forEach(text => assert.ok(!lectures.includes(text), `讲稿页面不应显示：${text}`))
assert.ok(lectures.includes('《细讲弟子规》讲稿学习'), '讲稿页面主标题不正确')
;['间隔复习', '评级只记录'].forEach(text => assert.ok(!review.includes(text), `复习页面不应显示：${text}`))

console.log(JSON.stringify({ passed: true, pages: 5 }))
