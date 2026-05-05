import { resolveBlogMediaUrl } from '@/lib/blog-api'

export type CategoryPostTag = {
  id?: number
  name: string
  slug?: string
}

export type CategoryPostCard = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  publishDate: string | null
  imageUrl: string | null
  readMinutes: number | null
  categoryLabel: string | null
  /** From API `tags` (preferred) or legacy `postTranslationTags`; drives Role filter. */
  tags: CategoryPostTag[]
  /** Tag names for Role sidebar filter (derived from `tags` + legacy junction). */
  roles: string[]
}

function readString(r: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k]
    if (typeof v === 'string' && v.trim()) return v
  }
  return undefined
}

function readNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number.parseFloat(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/** Nest public API: flat `tags: [{ id, name, slug }]`. */
function readTagsFromRow(r: Record<string, unknown>): CategoryPostTag[] {
  const raw = r.tags
  if (!Array.isArray(raw)) return []

  const out: CategoryPostTag[] = []
  for (const item of raw) {
    if (item == null || typeof item !== 'object') continue
    const t = item as Record<string, unknown>
    const name = readString(t, 'name', 'title', 'label')
    if (!name) continue
    const id = readNumber(t.id)
    const slug = readString(t, 'slug')
    out.push({
      ...(id !== undefined ? { id } : {}),
      name,
      ...(slug ? { slug } : {}),
    })
  }
  return out
}

/** Legacy junction `postTranslationTags` → tag names. */
function readRolesFromTranslationTags(r: Record<string, unknown>): string[] {
  const raw = r.postTranslationTags ?? r.post_translation_tags
  if (!Array.isArray(raw)) return []

  const out: string[] = []
  for (const entry of raw) {
    const row = entry as Record<string, unknown>
    const tag = row.tag as Record<string, unknown> | undefined
    const name =
      (tag && (readString(tag, 'name', 'title', 'label'))) ||
      readString(row, 'name', 'title')
    if (name) out.push(name)
  }
  return out
}

function uniqueStrings(xs: string[]): string[] {
  return [...new Set(xs)]
}

function isoDate(raw: unknown): string | null {
  if (raw == null) return null
  if (raw instanceof Date) return raw.toISOString()
  const s = String(raw)
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/**
 * Maps one raw row from `GET /public/blog/posts/by-category/:id?flat=1` (Nest + TypeORM JSON)
 * into card fields. Handles camelCase or snake_case keys defensively.
 */
export function normalizeFlatPostRow(row: unknown, fallbackCategoryName?: string): CategoryPostCard {
  if (row == null || typeof row !== 'object') {
    return {
      id: 0,
      title: '',
      slug: '',
      excerpt: null,
      publishDate: null,
      imageUrl: null,
      readMinutes: null,
      categoryLabel: fallbackCategoryName ?? null,
      tags: [],
      roles: [],
    }
  }

  const r = row as Record<string, unknown>
  const post = (r.post != null && typeof r.post === 'object' ? r.post : {}) as Record<string, unknown>
  const category = (post.category != null && typeof post.category === 'object' ? post.category : {}) as Record<
    string,
    unknown
  >

  const imageFile =
    readString(r, 'mainImage', 'main_image', 'ogImage', 'og_image') ?? undefined

  const readMinutes = readNumber(post.readingTime ?? post.reading_time)

  const categoryLabel =
    readString(category, 'typeName', 'type_name') ?? fallbackCategoryName ?? null

  const tags = readTagsFromRow(r)
  const roles = uniqueStrings([
    ...tags.map((t) => t.name),
    ...readRolesFromTranslationTags(r),
  ])

  return {
    id: readNumber(r.id) ?? 0,
    title: readString(r, 'title') ?? '',
    slug: readString(r, 'slug') ?? '',
    excerpt: readString(r, 'excerpt') ?? null,
    publishDate:
      isoDate(r.publishDate ?? r.publish_date) ??
      isoDate(post.publishDate ?? post.publish_date) ??
      isoDate(r.createdAt ?? r.created_at) ??
      isoDate(post.createdAt ?? post.created_at),
    imageUrl: resolveBlogMediaUrl(imageFile ?? null),
    readMinutes: readMinutes ?? null,
    categoryLabel,
    tags,
    roles,
  }
}
