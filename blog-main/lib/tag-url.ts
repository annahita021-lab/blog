import type { CategoryPostTag } from '@/lib/category-post-utils'

/** Match backend: lowercase NFC trim; non-alphanumeric → `-`. */
export function slugifyTagLabel(name: string): string {
  return (name || '')
    .trim()
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Path segment used in `/tag/[slug]` (must align with API resolution). */
export function slugSegmentForTag(tag: Pick<CategoryPostTag, 'slug' | 'name'>): string {
  const raw = (tag.slug?.trim() || '').normalize('NFC')
  if (raw.length > 0) return raw
  return slugifyTagLabel(tag.name)
}

export function tagBrowsePath(tag: Pick<CategoryPostTag, 'slug' | 'name'>): string {
  return `/tag/${encodeURIComponent(slugSegmentForTag(tag))}`
}
