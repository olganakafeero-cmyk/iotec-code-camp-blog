const KEY = 'paidBlogAccess'

export type AccessMap = Record<string, string>

export function getAccess(): AccessMap {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AccessMap) : {}
  } catch {
    return {}
  }
}

export function saveAccess(slug: string, transactionId: string): AccessMap {
  const next = { ...getAccess(), [slug]: transactionId }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage unavailable
  }
  return next
}