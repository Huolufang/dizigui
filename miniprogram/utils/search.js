const { courses, units, lectures } = require('../data/content')

function normalize(text) { return String(text || '').replace(/[\s，。；：、！？“”‘’（）《》·,.!?;:'"()[\]{}\-]/g, '') }
function count(source, term) {
  let total = 0
  let index = 0
  while ((index = source.indexOf(term, index)) !== -1) { total += 1; index += term.length }
  return total
}
function snippet(text, terms) {
  const source = String(text || '')
  let index = -1
  terms.some(term => { index = source.indexOf(term); return index >= 0 })
  if (index < 0) return source.slice(0, 90)
  return `${index > 26 ? '…' : ''}${source.slice(Math.max(0, index - 26), index + 64)}${index + 64 < source.length ? '…' : ''}`
}
function score(text, terms) {
  const source = normalize(text)
  const normalizedTerms = terms.map(normalize).filter(Boolean)
  if (!normalizedTerms.length || normalizedTerms.some(term => !source.includes(term))) return 0
  return normalizedTerms.reduce((sum, term) => sum + count(source, term), 0)
}
function search(query) {
  const terms = String(query || '').trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return { originals: [], courses: [], lectures: [], elapsed: 0 }
  const started = Date.now()
  const originals = units.map((unit, index) => {
    const text = `${unit.text}${unit.annotation}${unit.translation}`
    return { type: 'original', id: unit.id, courseId: unit.courseId, title: unit.text, snippet: snippet(text, terms), score: score(text, terms), order: index }
  }).filter(item => item.score).sort((a, b) => b.score - a.score || a.order - b.order)
  const courseResults = courses.map((course, index) => {
    const text = `${course.title}${course.intro}`
    return { type: 'course', id: course.id, courseId: course.id, title: course.title, snippet: snippet(text, terms), score: score(text, terms), order: index }
  }).filter(item => item.score).sort((a, b) => b.score - a.score || a.order - b.order)
  const lectureResults = []
  lectures.forEach(lecture => lecture.paragraphs.forEach((paragraph, index) => {
    const value = score(paragraph, terms)
    if (value) lectureResults.push({ type: 'lecture', id: `LECTURE-${lecture.number}-P-${index + 1}`, lectureNumber: lecture.number, paragraphIndex: index, title: `第${lecture.number}讲 · 第${index + 1}段`, snippet: snippet(paragraph, terms), score: value, order: lecture.number * 10000 + index })
  }))
  lectureResults.sort((a, b) => b.score - a.score || a.order - b.order)
  return { originals, courses: courseResults, lectures: lectureResults, elapsed: Date.now() - started }
}
module.exports = { normalize, search }
