/** Parse `?page=` for blog list routes; invalid or missing → 1. */
export function parseBlogListPage(
  searchParams: Record<string, string | string[] | undefined> | null | undefined,
): number {
  const raw = searchParams?.page
  const s = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(String(s ?? ''), 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

export function totalListPages(total: number, pageSize: number): number {
  if (total <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}

const MAX_PUBLIC_TAG_SLUGS = 20

/** Parse `?tagSlugs=a,b` for category list (deduped, max 20). */
export function parseCategoryTagSlugsParam(
  searchParams: Record<string, string | string[] | undefined> | null | undefined,
): string[] {
  const raw = searchParams?.tagSlugs
  const s = (Array.isArray(raw) ? raw[0] : raw)?.trim()
  if (!s) return []
  const parts = s.split(',').map((x) => x.trim()).filter(Boolean)
  return [...new Set(parts)].slice(0, MAX_PUBLIC_TAG_SLUGS)
}

/** Parse `?tagMatch=all|any` (default `any` when multiple slugs used from UI). */
export function parseCategoryTagMatchParam(
  searchParams: Record<string, string | string[] | undefined> | null | undefined,
): 'all' | 'any' {
  const raw = searchParams?.tagMatch
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase()
  if (v === 'all') return 'all'
  return 'any'
}

export type CategoryListQuery = {
  page?: number
  tagSlugs?: string[]
  tagMatch?: 'all' | 'any'
}

/** Build `/category/:id` href with optional page + multi-tag filter query. */
export function buildCategoryListHref(basePath: string, opts: CategoryListQuery): string {
  const sp = new URLSearchParams()
  const page = opts.page && opts.page > 1 ? opts.page : undefined
  if (page) sp.set('page', String(page))
  const tags = (opts.tagSlugs ?? []).slice(0, MAX_PUBLIC_TAG_SLUGS)
  if (tags.length) sp.set('tagSlugs', tags.join(','))
  const match = opts.tagMatch ?? 'any'
  if (tags.length > 1 && match === 'all') sp.set('tagMatch', 'all')
  const qs = sp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}
