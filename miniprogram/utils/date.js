function pad(value) { return String(value).padStart(2, '0') }
function localDate(input) {
  const d = input ? new Date(input) : new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function addDays(dateText, days) {
  const parts = dateText.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + Number(days))
  return localDate(d)
}
function today() { return localDate() }
function nowText(timestamp) {
  const d = new Date(timestamp || Date.now())
  return `${localDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
module.exports = { localDate, addDays, today, nowText }
