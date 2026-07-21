const { courses, units, lectures, getParagraphById } = require('../miniprogram/data/content')

function duplicates(values) {
  const seen = new Set()
  return values.filter(value => seen.has(value) || !seen.add(value))
}

const errors = []
const warnings = []
if (courses.length < 18 || courses.length > 24) errors.push(`课程数量 ${courses.length} 不在 18—24 范围内`)
if (lectures.length !== 40) errors.push(`讲次数量应为 40，实际为 ${lectures.length}`)
if (duplicates(courses.map(item => item.id)).length) errors.push('课程 ID 不唯一')
if (duplicates(units.map(item => item.id)).length) errors.push('原文单元 ID 不唯一')
if (duplicates(lectures.map(item => item.number)).length) errors.push('讲次编号不唯一')
if (lectures.some(item => !item.paragraphs.length)) errors.push('存在空讲稿')

const unitIds = new Set(units.map(item => item.id))
const lectureIds = new Set(lectures.map(item => item.number))
courses.forEach(course => {
  course.units.forEach(unit => { if (!unitIds.has(unit.id)) errors.push(`${course.id} 引用了无效原文单元 ${unit.id}`) })
  course.relatedLectures.forEach(number => { if (!lectureIds.has(number)) errors.push(`${course.id} 引用了无效讲次 ${number}`) })
  course.candidateHighlightParagraphIds.forEach(id => { if (!getParagraphById(id)) errors.push(`${course.id} 引用了无效讲稿段落 ${id}`) })
  if (course.candidateHighlightChars < 1200 || course.candidateHighlightChars > 2200) errors.push(`${course.id} 候选必读字数 ${course.candidateHighlightChars} 超出 1200—2200`)
  if (course.reviewStatus !== 'confirmed') warnings.push(`${course.id} 尚未完成人工内容审核`)
  course.units.forEach(unit => {
    if (!unit.annotation || !unit.translation || !unit.sourceLine) errors.push(`${unit.id} 缺少底稿候选映射`)
    if (!getParagraphById(unit.primaryCandidateParagraphId)) errors.push(`${unit.id} 缺少有效主讲稿候选`)
    if (!['no-difference', 'difference', 'not-applicable'].includes(unit.comparisonStatus)) warnings.push(`${unit.id} 释义差异待产品所有者确认`)
  })
})

const summary = {
  courses: courses.length,
  units: units.length,
  lectures: lectures.length,
  paragraphs: lectures.reduce((sum, item) => sum + item.paragraphs.length, 0),
  codeIntegrityPassed: errors.length === 0,
  releaseReady: errors.length === 0 && warnings.length === 0,
  errors: errors.length,
  warnings: warnings.length
}

console.log(JSON.stringify(summary, null, 2))
if (errors.length) console.error('\n错误\n- ' + errors.join('\n- '))
if (warnings.length) console.warn(`\n待产品所有者处理的内容审核项：${warnings.length} 项。\n前 10 项：\n- ${warnings.slice(0, 10).join('\n- ')}`)
if (errors.length || (process.argv.includes('--strict') && warnings.length)) process.exitCode = 1
