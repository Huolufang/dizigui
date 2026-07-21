const { days } = require('./legacy-course')
const { lectures } = require('./lectures')
const sourceMappings = require('./source-mappings')

const COLORS = ['lilac', 'lime', 'cream', 'pink', 'mint', 'coral']
const GENERIC_QUESTION = '这一课中，哪一句或哪段讲解对你最有启发？为什么？'

function lectureNumbers(label) {
  const nums = String(label || '').match(/\d+/g) || []
  if (!nums.length) return []
  if (nums.length === 1) return [Number(nums[0])]
  const start = Number(nums[0])
  const end = Number(nums[1])
  const result = []
  for (let n = start; n <= end && n <= 40; n += 1) result.push(n)
  return result
}

const courses = days.filter(item => item.type === 'lesson' && item.units.length).map((item, index) => {
  const id = `COURSE-${String(index + 1).padStart(2, '0')}`
  const courseMapping = sourceMappings.courses[id] || {}
  return {
    id,
    order: index + 1,
    orderLabel: String(index + 1).padStart(2, '0'),
    legacyDay: item.day,
    chapter: item.chapter,
    title: item.title,
    intro: `本课学习${item.chapter}中的 ${item.units.length} 个原文单元。`,
    estimate: Math.max(18, Math.min(24, item.estimate || 20)),
    color: COLORS[index % COLORS.length],
    units: item.units.map((unit, unitIndex) => {
      const mapping = sourceMappings.units[unit.id] || {}
      return {
        id: unit.id,
        order: unitIndex + 1,
        chapter: item.chapter,
        text: unit.text,
        pronunciation: mapping.pronunciation || '',
        annotation: mapping.annotation || '底稿引用位置待人工核对。',
        translation: mapping.translation || '译文待从受控学习底稿逐项确认。',
        sourceOriginal: mapping.sourceOriginal || '',
        sourceLine: mapping.sourceLine || 0,
        sourceMatchStatus: mapping.sourceMatchStatus || 'unmapped',
        primaryCandidateParagraphId: mapping.primaryCandidateParagraphId || '',
        candidateParagraphIds: mapping.candidateParagraphIds || [],
        coverageCandidateParagraphIds: mapping.coverageCandidateParagraphIds || [],
        coveredPhraseCount: mapping.coveredPhraseCount || 0,
        totalPhraseCount: mapping.totalPhraseCount || 0,
        supplementalParagraphIds: mapping.supplementalParagraphIds || [],
        supplementalOutcome: mapping.supplementalOutcome || '',
        supplementalRationale: mapping.supplementalRationale || '',
        proposedComparisonStatus: mapping.proposedComparisonStatus || '',
        proposalLabel: mapping.ownerConfirmed
          ? ({ 'no-difference': '已确认：无差异', difference: '已确认：有差异', 'not-applicable': '已确认：部分原文暂无直接讲稿' }[mapping.comparisonStatus]) || ''
          : ({ 'no-difference': '预审建议：无差异', difference: '预审建议：有差异', 'needs-better-paragraph': '预审建议：待补直接讲解', 'not-applicable': '预审建议：不适用' }[mapping.proposedComparisonStatus]) || '',
        proposalRationale: mapping.proposalRationale || '',
        proposalConfidence: mapping.proposalConfidence || '',
        comparisonStatus: mapping.comparisonStatus || 'manual-review-required',
        comparisonNote: mapping.comparisonNote || '',
        ownerConfirmed: Boolean(mapping.ownerConfirmed),
        comparisonAlert: mapping.comparisonAlert || '',
        variantDecision: mapping.variantDecision || ''
      }
    }),
    relatedLectures: lectureNumbers(item.cai && item.cai.lecture),
    candidateHighlightParagraphIds: courseMapping.candidateHighlightParagraphIds || [],
    candidateHighlightChars: courseMapping.highlightChars || 0,
    loadStatus: courseMapping.loadStatus || 'unreviewed',
    question: GENERIC_QUESTION,
    reviewStatus: courseMapping.reviewStatus === 'confirmed' ? 'confirmed' : 'pending-owner-confirmation',
    reviewLabel: courseMapping.reviewStatus === 'confirmed' ? '内容已确认' : '待产品所有者确认'
  }
})

courses.forEach(course => {
  course.reviewSupplementalParagraphIds = Array.from(new Set(course.units.reduce((all, unit) => all.concat(unit.supplementalParagraphIds), [])))
  course.semanticProposalCounts = course.units.reduce((counts, unit) => {
    const status = unit.proposedComparisonStatus || 'pending'
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})
})

const units = courses.reduce((all, course) => all.concat(course.units.map(unit => Object.assign({}, unit, {
  courseId: course.id,
  courseOrder: course.order,
  courseTitle: course.title
}))), [])

function getCourse(id) { return courses.find(item => item.id === id) || courses[0] }
function getUnit(id) { return units.find(item => item.id === id) || null }
function getLecture(number) { return lectures.find(item => item.number === Number(number)) || null }
function getParagraphById(id) {
  const match = /^LECTURE-(\d+)-P-(\d+)$/.exec(String(id || ''))
  if (!match) return null
  const lecture = getLecture(Number(match[1]))
  const paragraphIndex = Number(match[2]) - 1
  if (!lecture || !lecture.paragraphs[paragraphIndex]) return null
  return { id, lectureNumber: lecture.number, paragraphIndex, text: lecture.paragraphs[paragraphIndex] }
}

module.exports = {
  CONTENT_VERSION: '2.0',
  GENERIC_QUESTION,
  courses,
  units,
  lectures,
  getCourse,
  getUnit,
  getLecture,
  getParagraphById
}
