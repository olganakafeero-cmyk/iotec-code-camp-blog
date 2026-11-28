const SLUG_KEY = 'selectedBlogSlug'
const PREVIEW_KEY = 'selectedBlogPreview'

// preview = true means "an admin clicked this from the dashboard".
export function selectBlog(slug: string, preview = false) {
  try {
    sessionStorage.setItem(SLUG_KEY, slug)
    sessionStorage.setItem(PREVIEW_KEY, preview ? '1' : '0')
  } catch {
    // storage unavailable
  }
}

export function getSelectedSlug(): string | null {
  try {
    return sessionStorage.getItem(SLUG_KEY)
  } catch {
    return null
  }
}

export function isPreview(): boolean {
  try {
    return sessionStorage.getItem(PREVIEW_KEY) === '1'
  } catch {
    return false
  }
}