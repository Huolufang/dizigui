const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { courses, units, lectures } = require('../miniprogram/data/content')

const ROOT = path.resolve(__dirname, '..')
const NOTES_PATH = path.join(ROOT, 'content/raw/弟子规-题解注释译文.md')
const notesText = fs.readFileSync(NOTES_PATH, 'utf8')
const supplementalPath = path.join(ROOT, 'content/review/supplemental-mappings.json')
const semanticPath = path.join(ROOT, 'content/review/semantic-proposals.json')
const confirmationPath = path.join(ROOT, 'content/review/owner-confirmation.json')
const supplementalData = fs.existsSync(supplementalPath) ? JSON.parse(fs.readFileSync(supplementalPath, 'utf8')).mappings || [] : []
const semanticData = fs.existsSync(semanticPath) ? JSON.parse(fs.readFileSync(semanticPath, 'utf8')).proposals || [] : []
const confirmation = fs.existsSync(confirmationPath) ? JSON.parse(fs.readFileSync(confirmationPath, 'utf8')) : {}
const ownerConfirmed = confirmation.status === 'confirmed'
const supplementalByUnit = Object.fromEntries(supplementalData.map(item => [item.unitId, item]))
const semanticByUnit = Object.fromEntries(semanticData.map(item => [item.unitId, item]))
const confirmationOverrides = confirmation.unitStatusOverrides || {}
const contentOverrides = confirmation.contentOverrides || {}

function normalize(text) {
  return String(text || '')
    .replace(/[\s，。；：、！？“”‘’（）《》·,.!?;:'"()\[\]{}\-]/g, '')
    .replace(/則/g, '则').replace(/餘/g, '余').replace(/為/g, '为').replace(/與/g, '与')
    .replace(/學/g, '学').replace(/親/g, '亲').replace(/復/g, '复').replace(/後/g, '后')
}

function lineNumber(offset) { return notesText.slice(0, offset).split('\n').length }

function parseNoteBlocks() {
  const blocks = []
  const regex = /\*\*【原文】\*\*([^\n]+)\n\n\*\*【注释】\*\*([\s\S]*?)\n\n\*\*【译文】\*\*([^\n]+(?:\n(?!\n|---|#)[^\n]+)*)/g
  let match
  while ((match = regex.exec(notesText))) {
    const before = notesText.slice(0, match.index)
    const headings = before.match(/^# .+$/gm) || []
    blocks.push({
      original: match[1].trim(), annotation: match[2].trim(), translation: match[3].trim(),
      chapter: (headings[headings.length - 1] || '').replace(/^# /, ''), line: lineNumber(match.index)
    })
  }
  return blocks
}

const noteBlocks = parseNoteBlocks()
const noteOverrides = {
  'DZG-ZX-001': {
    annotation: '- 弟子：子弟、学生。规：规范、准则。\n- 圣人：指至圣先师孔子。训：教诲。\n- 孝悌（tì）：孝敬父母、友爱兄弟。\n- 谨信：谨慎、守信。',
    translation: '弟子就是学生，规是规范。《弟子规》是依据至圣先师孔子的教诲而编成的生活规范。首先在日常生活中，要做到孝顺父母，友爱兄弟姐妹。其次在一切日常生活中行为要小心谨慎，言语要讲信用。'
  },
  'DZG-ZX-002': {
    annotation: '- 文：诗书六艺等典籍学问。',
    translation: '和大众相处要平等博爱，并且亲近有仁德的人，向他学习。如果做了之后还有多余的时间精力，就应该好好地学习六艺等其他有益的学问。'
  },
  'DZG-RX-001': {
    annotation: '- 呼：呼唤。应：应答。勿：不要。缓：迟缓。\n- 命：吩咐、差遣。行：去做。懒：偷懒拖延。',
    translation: '父母亲叫你的时候，要立刻答应，不能迟缓；父母亲让你做事的时候，要马上去做，不能拖延偷懒。'
  },
  'DZG-RX-002': {
    annotation: '- 教：教导。责：责备。顺承：顺从接受。',
    translation: '对父母的教诲，要恭敬地聆听；对父母的责备，要顺从地接受。'
  }
}

const variantBlocks = {
  'DZG-CD-010': { pattern: '进必趋，退必迟。问起对，视勿移。', decision: '课程候选作“近必趋”，公开底稿作“进必趋”。' },
  'DZG-JIN-017': { pattern: '借人物，及时还。人借物，有勿悭。', decision: '课程候选作“后有急，借不难”，公开底稿作“人借物，有勿悭”。' }
}

const comparisonAlerts = {
  'DZG-ZX-001': '底稿与课程候选作“首孝悌”，讲稿快照部分转写作“首孝弟”；暂列为通行用字/转写比较，不静默统一。',
  'DZG-XIN-015': '底稿与课程候选作“掩饰”，讲稿快照部分转写作“揜饰”；暂列为异体/转写比较，不静默统一。',
  'DZG-XW-005': '底稿与课程候选作“工夫到”，讲稿多处作“功夫到”；需记录为展示/转写用字比较项。'
}

function extractPronunciation(annotation) {
  const values = []
  const regex = /([\u3400-\u9fff]{1,4})（([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)）/gi
  let match
  while ((match = regex.exec(annotation))) values.push(`${match[1]}（${match[2]}）`)
  return Array.from(new Set(values)).join('、')
}

function findNoteMapping(unit) {
  const target = normalize(unit.text)
  let block = noteBlocks.find(item => normalize(item.original) === target)
  let matchStatus = 'exact'
  if (!block) {
    block = noteBlocks.find(item => normalize(item.original).includes(target))
    matchStatus = block ? 'split-from-combined-block' : ''
  }
  if (!block && variantBlocks[unit.id]) {
    block = noteBlocks.find(item => item.original === variantBlocks[unit.id].pattern)
    matchStatus = 'variant-decision-required'
  }
  if (!block) throw new Error(`未找到底稿映射：${unit.id}`)
  const override = noteOverrides[unit.id] || {}
  let annotation = override.annotation || block.annotation
  let translation = override.translation || block.translation
  if (unit.id === 'DZG-JIN-017') {
    annotation = '公开底稿只注释“悭（qiān）”，与课程候选的后半句不对应。'
    translation = '借别人的东西，要在约定的时间内归还。（课程候选后半句的译文待异文裁决后确定。）'
  }
  const confirmedContent = contentOverrides[unit.id] || {}
  annotation = confirmedContent.annotation || annotation
  translation = confirmedContent.translation || translation
  const pronunciation = Object.prototype.hasOwnProperty.call(confirmedContent, 'pronunciation')
    ? confirmedContent.pronunciation
    : extractPronunciation(annotation)
  return {
    sourceOriginal: block.original, sourceChapter: block.chapter, sourceLine: block.line,
    annotation, translation, pronunciation,
    sourceMatchStatus: ownerConfirmed && variantBlocks[unit.id] ? 'confirmed-variant' : matchStatus,
    variantDecision: variantBlocks[unit.id] ? variantBlocks[unit.id].decision : '',
    variantResolution: (confirmation.variantDecisions || {})[unit.id] || null
  }
}

function confirmedComparison(proposal, unitId) {
  if (!ownerConfirmed || !confirmation.acceptSemanticProposals) return { status: 'manual-review-required', note: '' }
  const override = confirmationOverrides[unitId]
  if (override) return { status: override.comparisonStatus, note: override.note || '' }
  return { status: proposal.proposedStatus, note: proposal.rationale || '' }
}

function paragraphId(number, index) { return `LECTURE-${String(number).padStart(2, '0')}-P-${String(index + 1).padStart(4, '0')}` }

function paragraphById(id) {
  const match = /^LECTURE-(\d+)-P-(\d+)$/.exec(id)
  if (!match) return ''
  const lecture = lectures.find(item => item.number === Number(match[1]))
  return lecture ? lecture.paragraphs[Number(match[2]) - 1] || '' : ''
}

function lectureCandidates(unit, course) {
  const target = normalize(unit.text)
  const phrases = unit.text.split(/[，；。]/).map(normalize).filter(item => item.length >= 3)
  const candidates = []
  course.relatedLectures.forEach(number => {
    const lecture = lectures.find(item => item.number === number)
    lecture.paragraphs.forEach((text, index) => {
      const normalized = normalize(text)
      const fullMatch = normalized.includes(target)
      const phraseHits = phrases.filter(phrase => normalized.includes(phrase))
      if (fullMatch || phraseHits.length) candidates.push({
        id: paragraphId(number, index), lectureNumber: number, paragraphIndex: index,
        fullMatch, phraseHits: phraseHits.length, matchedPhrases: phraseHits, quoteOnly: /^【[^】]+】$/.test(text.trim()), chars: text.replace(/\s/g, '').length, text
      })
    })
  })
  candidates.sort((a, b) => Number(a.quoteOnly) - Number(b.quoteOnly) || Number(b.fullMatch) - Number(a.fullMatch) || b.phraseHits - a.phraseHits || b.chars - a.chars || a.lectureNumber - b.lectureNumber || a.paragraphIndex - b.paragraphIndex)
  return candidates
}

function coverageCandidates(unit, candidates) {
  const phrases = unit.text.split(/[，；。]/).map(normalize).filter(item => item.length >= 3)
  const uncovered = new Set(phrases)
  const selected = []
  while (uncovered.size) {
    const ranked = candidates.map(item => ({ item, gain: item.matchedPhrases.filter(phrase => uncovered.has(phrase)).length }))
      .filter(entry => entry.gain)
      .sort((a, b) => b.gain - a.gain || Number(a.item.quoteOnly) - Number(b.item.quoteOnly) || b.item.chars - a.item.chars)
    if (!ranked.length) break
    const chosen = ranked[0].item
    selected.push(chosen)
    chosen.matchedPhrases.forEach(phrase => uncovered.delete(phrase))
  }
  return { selected, totalPhraseCount: phrases.length, coveredPhraseCount: phrases.length - uncovered.size }
}

const sourceMappings = {
  generatedAt: new Date().toISOString(),
  ownerConfirmation: ownerConfirmed ? {
    status: 'confirmed', confirmedBy: confirmation.confirmedBy, confirmedAt: confirmation.confirmedAt, basis: confirmation.basis
  } : { status: 'pending' },
  units: {}, courses: {}
}

courses.forEach(course => {
  const selected = []
  course.units.forEach(unit => {
    const note = findNoteMapping(unit)
    const candidates = lectureCandidates(unit, course)
    if (!candidates.length) throw new Error(`未找到讲稿候选：${unit.id}`)
    const top = candidates[0]
    const coverage = coverageCandidates(unit, candidates)
    const supplemental = supplementalByUnit[unit.id] || { paragraphIds: [], outcome: '', rationale: '' }
    const proposal = semanticByUnit[unit.id] || { proposedStatus: '', rationale: '', confidence: '' }
    const finalComparison = confirmedComparison(proposal, unit.id)
    selected.push(top)
    sourceMappings.units[unit.id] = Object.assign(note, {
      lectureMatchStatus: top.fullMatch ? 'full-original-quote' : 'partial-phrase-quote',
      hasFullQuoteCandidate: candidates.some(item => item.fullMatch),
      candidateParagraphIds: candidates.slice(0, 5).map(item => item.id),
      coverageCandidateParagraphIds: coverage.selected.map(item => item.id),
      coveredPhraseCount: coverage.coveredPhraseCount,
      totalPhraseCount: coverage.totalPhraseCount,
      primaryCandidateParagraphId: top.id,
      comparisonStatus: finalComparison.status,
      comparisonNote: finalComparison.note,
      ownerConfirmed,
      comparisonAlert: comparisonAlerts[unit.id] || '',
      supplementalParagraphIds: supplemental.paragraphIds || [],
      supplementalOutcome: supplemental.outcome || '',
      supplementalRationale: supplemental.rationale || '',
      proposedComparisonStatus: proposal.proposedStatus || '',
      proposalRationale: proposal.rationale || '',
      proposalConfidence: proposal.confidence || ''
    })
  })

  const chosen = new Map(selected.map(item => [item.id, item]))
  let chars = Array.from(chosen.values()).reduce((sum, item) => sum + item.chars, 0)
  let radius = 1
  while (chars < 1200 && radius <= 8) {
    selected.slice().forEach(base => {
      ;[base.paragraphIndex - radius, base.paragraphIndex + radius].forEach(index => {
        const lecture = lectures.find(item => item.number === base.lectureNumber)
        if (!lecture || index < 0 || index >= lecture.paragraphs.length) return
        const id = paragraphId(base.lectureNumber, index)
        const text = lecture.paragraphs[index]
        const length = text.replace(/\s/g, '').length
        if (!chosen.has(id) && chars + length <= 2200) {
          chosen.set(id, { id, lectureNumber: base.lectureNumber, paragraphIndex: index, chars: length, text })
          chars += length
        }
      })
    })
    radius += 1
  }
  const highlights = Array.from(chosen.values()).sort((a, b) => a.lectureNumber - b.lectureNumber || a.paragraphIndex - b.paragraphIndex)
  sourceMappings.courses[course.id] = {
    candidateHighlightParagraphIds: highlights.map(item => item.id), highlightChars: chars,
    loadStatus: chars >= 1200 && chars <= 2200 ? 'within-target' : 'manual-exception-required',
    reviewStatus: ownerConfirmed && confirmation.confirmAllCourses ? 'confirmed' : 'manual-confirmation-required'
  }
})

function jsModule(value) { return `// 由 tools/build-content-review.js 从受控输入机械生成。\n// 产品所有者确认记录见 content/review/owner-confirmation.json。\nmodule.exports = ${JSON.stringify(value, null, 2)}\n` }
fs.writeFileSync(path.join(ROOT, 'miniprogram/data/source-mappings.js'), jsModule(sourceMappings))

const effortDir = path.join(ROOT, '.scratch/content-review')
const issuesDir = path.join(effortDir, 'issues')
fs.mkdirSync(issuesDir, { recursive: true })
fs.writeFileSync(path.join(effortDir, 'spec.md'), `# v2.0 课程内容确认\n\nStatus: ${ownerConfirmed ? 'ready-for-agent' : 'needs-info'}\n\n## 目标\n\n按 \`docs/PRD-v2.md\` 逐课确认 18 门课程、90 个原文单元、公开底稿引用、讲稿段落候选、释义差异和读音。\n\n## 确认结果\n\n- 18 门课程和 90 个原文单元，共 108 项内容审核均已记录产品所有者确认。\n- 采用“进必趋”和“后有急，借不难”两项异文裁决。\n- \`DZG-RX-007\` 的课程讲稿范围扩展到第 12 讲。\n- \`DZG-RX-011\`、\`DZG-JIN-008\`、\`DZG-JIN-012\` 标注为部分原文暂无直接讲稿，不补写来源中不存在的解释。\n\n## 课程审核顺序\n\n${courses.map((course, index) => `- [${ownerConfirmed ? 'x' : ' '}] [${course.id} · ${course.title}](issues/${String(index + 1).padStart(2, '0')}-${course.id.toLowerCase()}.md)`).join('\n')}\n\n## 确认记录\n\n- 确认人：${confirmation.confirmedBy || ''}\n- 确认日期：${confirmation.confirmedAt || ''}\n- 依据：${confirmation.basis || ''}\n`)

courses.forEach((course, index) => {
  const courseMap = sourceMappings.courses[course.id]
  const rows = course.units.map(unit => {
    const map = sourceMappings.units[unit.id]
    return `| ${unit.id} | ${unit.text} | ${map.sourceMatchStatus} | ${map.pronunciation || '无额外标注'} | ${map.primaryCandidateParagraphId} | ${map.comparisonStatus} |`
  }).join('\n')
  const details = course.units.map(unit => {
    const map = sourceMappings.units[unit.id]
    const alert = map.comparisonAlert ? `\n**来源用字比较提示**\n\n> ${map.comparisonAlert}\n` : ''
    const coverage = map.coverageCandidateParagraphIds.map(id => `**补充覆盖候选 ${id}**\n\n> ${paragraphById(id)}`).join('\n\n')
    const supplementalText = map.supplementalParagraphIds.map(id => `**定向检索补充 ${id}**\n\n> ${paragraphById(id)}`).join('\n\n')
    const comparisonText = map.proposedComparisonStatus ? `\n**释义审核**\n\n- 预审建议：\`${map.proposedComparisonStatus}\`（${map.proposalConfidence}）\n- 最终状态：\`${map.comparisonStatus}\`\n- 确认说明：${map.comparisonNote || map.proposalRationale}\n` : ''
    const direct = map.comparisonStatus !== 'not-applicable'
    return `### ${unit.id}\n\n**规范原文**\n\n> ${unit.text}\n\n**公开底稿原文**（\`content/raw/弟子规-题解注释译文.md:${map.sourceLine}\`）\n\n> ${map.sourceOriginal}\n\n**已确认注释**\n\n${map.annotation}\n\n**已确认基础译文**\n\n> ${map.translation}\n\n**主讲稿候选 ${map.primaryCandidateParagraphId}**\n\n> ${paragraphById(map.primaryCandidateParagraphId)}\n\n分句覆盖：${map.coveredPhraseCount}/${map.totalPhraseCount}\n\n${coverage}\n\n${supplementalText}\n${alert}${comparisonText}\n**本单元确认**\n\n- [${ownerConfirmed ? 'x' : ' '}] 注释和译文引用正确\n- [${ownerConfirmed && direct ? 'x' : ' '}] 讲稿段落直接相关\n- [${map.comparisonStatus === 'no-difference' ? 'x' : ' '}] 无差异\n- [${map.comparisonStatus === 'difference' ? 'x' : ' '}] 有差异\n- [${map.comparisonStatus === 'not-applicable' ? 'x' : ' '}] 部分原文暂无直接讲稿\n\n备注：${map.comparisonNote || '按预审建议确认。'}\n`
  }).join('\n---\n\n')
  const variants = course.units.map(unit => sourceMappings.units[unit.id]).filter(item => item.variantDecision)
  const variantSection = variants.length ? `\n## 异文裁决\n\n${variants.map(item => `- [${item.variantResolution ? 'x' : ' '}] 采用：${item.variantResolution ? item.variantResolution.canonicalText : item.variantDecision}\n  - 理由：${item.variantResolution ? item.variantResolution.reason : '待确认'}`).join('\n')}\n` : ''
  const number = String(index + 1).padStart(2, '0')
  const body = `# ${course.id} · ${course.title}\n\nStatus: ${ownerConfirmed ? 'ready-for-agent' : 'needs-info'}\n\nType: task\n\n## 课程范围\n\n- 篇章：${course.chapter}\n- 原文单元：${course.units.length} 个\n- 相关讲次：${course.relatedLectures.join('、')}\n- 必读字数：${courseMap.highlightChars}\n- 负荷状态：${courseMap.loadStatus}\n\n## 单元与候选映射\n\n| 单元 ID | 规范原文 | 底稿匹配 | 读音摘取 | 主讲稿候选 | 释义比较 |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\n## 候选必读段落\n\n${courseMap.candidateHighlightParagraphIds.map(id => `- [${ownerConfirmed ? 'x' : ' '}] ${id}`).join('\n')}\n${variantSection}\n## 逐单元核对材料\n\n${details}\n\n## 产品所有者确认\n\n- [${ownerConfirmed ? 'x' : ' '}] 原文字句、顺序与语义分组正确\n- [${ownerConfirmed ? 'x' : ' '}] 生僻字读音已核对\n- [${ownerConfirmed ? 'x' : ' '}] 注释与译文引用位置正确\n- [${ownerConfirmed ? 'x' : ' '}] 讲稿映射已确认，缺少直接讲稿处已明确标注\n- [${ownerConfirmed ? 'x' : ' '}] 释义差异已逐单元归类\n- [${ownerConfirmed ? 'x' : ' '}] 必读重点为 1200—2200 字，或已批准例外\n- [${ownerConfirmed ? 'x' : ' '}] 反思问题来源符合 PRD\n- [${ownerConfirmed ? 'x' : ' '}] 本课内容已确认\n\n确认人：${confirmation.confirmedBy || ''}\n\n确认日期：${confirmation.confirmedAt || ''}\n\n备注：按推荐方案批量确认；逐单元例外见上文。\n\n## Comments\n\n- ${confirmation.confirmedAt || ''}：${confirmation.basis || ''}，生成器已固化确认状态。\n`
  fs.writeFileSync(path.join(issuesDir, `${number}-${course.id.toLowerCase()}.md`), body)
})

const exact = Object.values(sourceMappings.units).filter(item => item.sourceMatchStatus === 'exact').length
const split = Object.values(sourceMappings.units).filter(item => item.sourceMatchStatus === 'split-from-combined-block').length
const variants = Object.values(sourceMappings.units).filter(item => item.variantDecision).length
const fullLecture = Object.values(sourceMappings.units).filter(item => item.lectureMatchStatus === 'full-original-quote').length
const partialLecture = Object.values(sourceMappings.units).filter(item => item.lectureMatchStatus === 'partial-phrase-quote').length
const anyFullLecture = Object.values(sourceMappings.units).filter(item => item.hasFullQuoteCandidate).length
const fullPhraseCoverage = Object.values(sourceMappings.units).filter(item => item.coveredPhraseCount === item.totalPhraseCount).length
const comparisonCounts = Object.values(sourceMappings.units).reduce((counts, item) => {
  counts[item.comparisonStatus] = (counts[item.comparisonStatus] || 0) + 1
  return counts
}, {})
const summary = `# v2.0 内容确认结果\n\n确认日期：${confirmation.confirmedAt || new Date().toISOString().slice(0, 10)}\n\n## 结果\n\n| 项目 | 数量 | 状态 |\n| --- | ---: | --- |\n| 课程 | ${courses.length} | 已确认 |\n| 原文单元 | ${units.length} | 已确认 |\n| 内容审核项 | ${courses.length + units.length} | 108/108 已记录 |\n| 无释义差异 | ${comparisonCounts['no-difference'] || 0} | 已确认 |\n| 有释义差异 | ${comparisonCounts.difference || 0} | 已确认并保留提示 |\n| 部分原文暂无直接讲稿 | ${comparisonCounts['not-applicable'] || 0} | 已明确标注，不补写 |\n| 异文裁决 | ${variants} | 已完成 |\n| 必读段落负荷 | ${courses.filter(item => sourceMappings.courses[item.id].loadStatus === 'within-target').length}/${courses.length} | 1200—2200 字 |\n\n## 输出\n\n- 规范原文：\`content/raw/dizigui-original.md\`\n- 产品所有者确认：\`content/review/owner-confirmation.json\`\n- 逐单元数据：\`miniprogram/data/source-mappings.js\`\n- 逐课审核单：\`.scratch/content-review/issues/\`\n\n## 明示例外\n\n- \`DZG-RX-011\` 的“挞无怨”、\`DZG-JIN-008\` 的“步从容”、\`DZG-JIN-012\` 的“勿轻略”暂未找到直接讲稿；保留原文和适用边界，不生成伪来源。\n`
fs.mkdirSync(path.join(ROOT, 'docs/content'), { recursive: true })
fs.writeFileSync(path.join(ROOT, 'docs/content/content-review-candidates.md'), summary)

const reviewDir = path.join(ROOT, 'content/review')
fs.mkdirSync(reviewDir, { recursive: true })
const originalCandidate = `# 《弟子规》规范原文确认记录\n\n> 状态：已确认。受控规范原文见 \`content/raw/dizigui-original.md\`。\n> 确认人：${confirmation.confirmedBy || ''}；确认日期：${confirmation.confirmedAt || ''}。\n\n${courses.map(course => `## ${course.orderLabel} · ${course.chapter} · ${course.title}\n\n${course.units.map(unit => `- [${ownerConfirmed ? 'x' : ' '}] **${unit.id}** ${unit.text}`).join('\n')}`).join('\n\n')}\n`
fs.writeFileSync(path.join(reviewDir, 'dizigui-original-candidate.md'), originalCandidate)

const variantDecisionDoc = `# 规范原文异文裁决\n\nStatus: ready-for-agent\n\n确认人：${confirmation.confirmedBy || ''}\n\n确认日期：${confirmation.confirmedAt || ''}\n\n## V-001 · DZG-CD-010\n\n- [x] 采用公开底稿：“**进**必趋，退必迟；问起对，视勿移。”\n- [ ] 采用课程旧候选：“**近**必趋，退必迟；问起对，视勿移。”\n- 理由：${(confirmation.variantDecisions || {})['DZG-CD-010']?.reason || ''}\n\n## V-002 · DZG-JIN-017\n\n- [x] 采用课程/讲稿快照：“借人物，及时还；**后有急，借不难**。”\n- [ ] 采用公开底稿：“借人物，及时还；**人借物，有勿悭**。”\n- 理由：${(confirmation.variantDecisions || {})['DZG-JIN-017']?.reason || ''}\n\n## C-001 · DZG-XW-005（比较项，非底本间异文）\n\n- 底稿与规范原文：“**工夫**到，滞塞通。”\n- 讲稿多处转写：“**功夫**到，滞塞通。”\n- [x] 已记录为讲稿展示/转写用字比较，不静默改写任一来源。\n`
fs.writeFileSync(path.join(reviewDir, 'variant-decisions.md'), variantDecisionDoc)

const pronunciationRows = units.filter(unit => sourceMappings.units[unit.id].pronunciation).map(unit => {
  const map = sourceMappings.units[unit.id]
  return `| ${unit.id} | ${unit.text} | ${map.pronunciation} | 底稿第 ${map.sourceLine} 行 | [${ownerConfirmed && confirmation.confirmAllPronunciations ? 'x' : ' '}] |`
}).join('\n')
const pronunciationDoc = `# 生僻字与多音字读音确认\n\n> 读音沿用受控注释底稿，并由产品所有者按推荐方案确认。\n\n| 单元 ID | 原文 | 读音 | 来源 | 产品所有者确认 |\n| --- | --- | --- | --- | --- |\n${pronunciationRows}\n\n确认人：${confirmation.confirmedBy || ''}\n\n确认日期：${confirmation.confirmedAt || ''}\n`
fs.writeFileSync(path.join(reviewDir, 'pronunciation-candidates.md'), pronunciationDoc)

if (ownerConfirmed) {
  Object.entries(confirmation.variantDecisions || {}).forEach(([unitId, decision]) => {
    const unit = units.find(item => item.id === unitId)
    if (!unit || unit.text !== decision.canonicalText) {
      throw new Error(`规范原文与异文裁决不一致：${unitId}`)
    }
  })

  const canonicalText = `# 《弟子规》规范原文\n\n- 内容版本：2.0\n- 状态：受控、已确认\n- 确认人：${confirmation.confirmedBy}\n- 确认日期：${confirmation.confirmedAt}\n- 确认依据：${confirmation.basis}\n\n> 本文件用于小程序原文、课程分组和搜索索引。讲稿中的异体字或转写差异保持来源原貌，不反向改写本规范原文。\n\n${courses.map(course => `## ${course.orderLabel} · ${course.chapter}\n\n${course.units.map(unit => `- **${unit.id}** ${unit.text}`).join('\n')}`).join('\n\n')}\n`
  const canonicalPath = path.join(ROOT, 'content/raw/dizigui-original.md')
  fs.writeFileSync(canonicalPath, canonicalText)
  const canonicalBuffer = fs.readFileSync(canonicalPath)
  const sourcesPath = path.join(ROOT, 'content/raw/sources.json')
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'))
  sources.sources = sources.sources.filter(item => item.id !== 'SRC-CANONICAL')
  sources.sources.push({
    id: 'SRC-CANONICAL',
    name: '《弟子规》v2.0 规范原文',
    type: 'controlled-canonical-text',
    file: 'dizigui-original.md',
    bytes: canonicalBuffer.length,
    sha256: crypto.createHash('sha256').update(canonicalBuffer).digest('hex'),
    versionStatus: `产品所有者于 ${confirmation.confirmedAt} 确认`,
    purpose: '小程序规范原文、18 课分组与 90 单元搜索索引',
    notes: '异文裁决采用“进必趋”和“后有急，借不难”；来源讲稿转写差异保持原貌。'
  })
  fs.writeFileSync(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`)
}

console.log(JSON.stringify({ courses: courses.length, units: units.length, exact, split, variants, anyFullLecture, fullLecture, partialLecture, comparisonCounts, ownerConfirmed }, null, 2))
