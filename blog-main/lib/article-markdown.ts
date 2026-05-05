export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

/** Stable fragment id from visible heading text (matches markdown TOC slugs). */
export function slugifyHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Add missing `id` on `<h2>` / `<h3>` so in-page nav and scroll-spy work for CMS HTML.
 */
export function ensureHtmlHeadingIds(html: string): string {
  const used = new Set<string>()
  const uniqueId = (base: string) => {
    const slug = slugifyHeadingId(base) || 'section'
    let n = 0
    let id = slug
    while (used.has(id)) {
      n += 1
      id = `${slug}-${n}`
    }
    used.add(id)
    return id
  }

  return html.replace(/<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi, (full, level: string, attrs: string, inner: string) => {
    const a = attrs || ''
    if (/id\s*=\s*["']/i.test(a)) {
      const im = /id\s*=\s*["']([^"']+)["']/i.exec(a)
      if (im?.[1]) used.add(im[1].trim())
      return full
    }
    const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    const id = uniqueId(text)
    const tail = a.trim() ? `${a.trim()} id="${id}"` : `id="${id}"`
    return `<h${level} ${tail}>${inner}</h${level}>`
  })
}

/** Build TOC from HTML (after {@link ensureHtmlHeadingIds} so anchors exist in the DOM). */
export function extractHeadingsFromHtml(html: string): TableOfContentsItem[] {
  const headings: TableOfContentsItem[] = []
  const re = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const level = Number(m[1])
    const attrs = m[2] || ''
    const inner = m[3] || ''
    const idMatch = /id\s*=\s*["']([^"']+)["']/i.exec(attrs)
    const id = idMatch?.[1]?.trim()
    const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (!id || !text) continue
    headings.push({ id, text, level })
  }
  return headings
}

export function extractHeadings(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TableOfContentsItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = slugifyHeadingId(text)
    headings.push({ id, text, level })
  }

  return headings
}

export function parseArticleMarkdown(content: string): string {
  let html = content
    .replace(/^### (.+)$/gm, (_, text: string) => {
      const id = slugifyHeadingId(text)
      return `<h3 id="${id}" class="text-lg font-semibold text-foreground mt-8 mb-3">${text}</h3>`
    })
    .replace(/^## (.+)$/gm, (_, text: string) => {
      const id = slugifyHeadingId(text)
      return `<h2 id="${id}" class="text-xl font-semibold text-foreground mt-10 mb-4">${text}</h2>`
    })
    .replace(/```([^`]+)```/g, '<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-muted-foreground list-decimal">$2</li>')
    .replace(/^(?!<[hlupc]|$)(.+)$/gm, '<p class="text-muted-foreground leading-relaxed mb-4">$1</p>')

  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, '<ul class="space-y-2 my-4">$&</ul>')

  return html
}
