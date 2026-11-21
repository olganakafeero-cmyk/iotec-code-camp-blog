export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function countWords(html: string): number {
  const text = htmlToText(html)
  return text ? text.split(' ').length : 0
}

export function readTimeFor(words: number): string {
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export function makePreviewHtml(html: string, blocks = 2): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.body.children)
    .slice(0, blocks)
    .map((element) => element.outerHTML)
    .join('')
}
export function makeExcerpt(html: string, maxLength = 160): string {
  const text = htmlToText(html)
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

export function readMinutesLabel(words: number): string {
  return `~${Math.max(words / 200, 0.5).toFixed(1)} min read`
}

export async function getImageDimensions(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const size = `${bitmap.width} × ${bitmap.height}`
  bitmap.close()
  return size
}