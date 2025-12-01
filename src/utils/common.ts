export function ellipsisMiddle(str: string | number | undefined, leftNum = 6, rightNum = 4) {
  if (str === undefined) {
    return ''
  }
  const newStr = str.toString()
  if (leftNum + rightNum >= newStr.length) return newStr
  return newStr.slice(0, leftNum) + '...' + newStr.slice(-rightNum)
}

const MAX_IDS = 1_000_000
const _used = new Uint8Array(MAX_IDS)
let _usedCount = 0
let _cursor = Math.floor(Math.random() * MAX_IDS)

export function generateTimeBasedSixDigitId(): string {
  if (_usedCount >= MAX_IDS) {
    _used.fill(0)
    _usedCount = 0
    _cursor = Math.floor(Math.random() * MAX_IDS)
  }

  for (let i = 0; i < MAX_IDS; i++) {
    const candidate = (_cursor + i) % MAX_IDS
    if (!_used[candidate]) {
      _used[candidate] = 1
      _usedCount++
      _cursor = (candidate + 1) % MAX_IDS
      return String(candidate).padStart(6, '0')
    }
  }

  return String(Math.floor(Math.random() * MAX_IDS)).padStart(6, '0')
}
