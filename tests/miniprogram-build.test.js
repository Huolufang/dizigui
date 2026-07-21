const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const projectConfigPath = path.join(root, 'project.config.json')
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))

assert.strictEqual(projectConfig.miniprogramRoot, 'miniprogram/', 'project.config.json 必须声明 miniprogramRoot')

const appRoot = path.join(root, projectConfig.miniprogramRoot)
const appJsonPath = path.join(appRoot, 'app.json')
assert.ok(fs.existsSync(appJsonPath), `找不到 ${appJsonPath}`)
const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
assert.ok(Array.isArray(appConfig.pages) && appConfig.pages.length > 0, 'app.json 必须包含非空 pages')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

const wxmlFiles = walk(appRoot).filter(file => file.endsWith('.wxml'))
const jsonFiles = walk(appRoot).filter(file => file.endsWith('.json'))
jsonFiles.forEach(file => {
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(file, 'utf8')), `${path.relative(root, file)} 不是有效 JSON`)
})
appConfig.pages.forEach(page => {
  ;['.js', '.json', '.wxml', '.wxss'].forEach(extension => {
    assert.ok(fs.existsSync(path.join(appRoot, `${page}${extension}`)), `${page}${extension} 不存在`)
  })
})
const encodedConditions = []
wxmlFiles.forEach(file => {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
    if (/wx:(?:if|elif)="[^"]*&amp;&amp;/.test(line)) {
      encodedConditions.push(`${path.relative(root, file)}:${index + 1}`)
    }
  })
})
assert.deepStrictEqual(encodedConditions, [], `WXML 条件不能使用 &amp;&amp;：${encodedConditions.join('、')}`)

console.log(JSON.stringify({ passed: true, appJson: path.relative(root, appJsonPath), pages: appConfig.pages.length, jsonFiles: jsonFiles.length, wxmlFiles: wxmlFiles.length }))
