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

export function generateUUID() {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export function getAccountTypeLabel(type: string) {
  switch (type) {
    case 'funded':
      return 'Funded'
    case 'evaluation':
      return 'Evaluation'
    case 'trading':
      return 'Trading'
    default:
      return 'Unknown'
  }
}

export function getAccountStatusLabel(type: string) {
  switch (type) {
    case 'active':
      return 'Active'
    case 'inactive':
      return 'Inactive'
    default:
      return 'Unknown'
  }
}

export function getWithdrawalStatusLabel(status: string) {
  switch (status) {
    case 'success':
      return 'Success'
    case 'pending':
      return 'Pending'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
