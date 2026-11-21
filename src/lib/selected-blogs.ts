const KEY = 'selectedBlogSlug'

export function selectBlog(slug: string) {
  try {
    sessionStorage.setItem(KEY, slug)
  } catch {
    // storage unavailable
  }
}

export function getSelectedSlug(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}