const IDS_KEY = 'unlockedPosts'
const EMAIL_KEY = 'readerEmail'

export function getUnlocked(): number[] {
  try {
    const raw = localStorage.getItem(IDS_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function unlockPost(id: number, email: string) {
  try {
    const ids = new Set(getUnlocked())
    ids.add(id)
    localStorage.setItem(IDS_KEY, JSON.stringify(Array.from(ids)))
    localStorage.setItem(EMAIL_KEY, email.toLowerCase())
  } catch {
    // storage unavailable
  }
}

export function restoreAccess(email: string): number[] {
  try {
    if (localStorage.getItem(EMAIL_KEY) === email.toLowerCase()) {
      return getUnlocked()
    }
  } catch {
    // storage unavailable
  }
  return []
}