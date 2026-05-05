/**
 * Public blog HTTP API — aligned with Pikgo `site-dynamic` /blog-list (`getBlogListCategories`, categories endpoint).
 */

import { getBlogLanguage } from '@/lib/blog-env'

export type BlogCategory = {
  id: number
  typeName: string
  children?: BlogCategory[]
  postCount?: number
  totalPostCount?: number
  icon?: string | null
}

function toInt(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v)
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number.parseInt(v, 10)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/** Flatten nested `PublicCategoryNode[]` from API into linkable cards (direct children only). */
function normalizePublicCategoryList(raw: unknown[]): BlogCategory[] {
  const out: BlogCategory[] = []
  for (const item of raw) {
    if (item == null || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = toInt(o.id)
    const typeName =
      typeof o.typeName === 'string'
        ? o.typeName
        : typeof o.type_name === 'string'
          ? o.type_name
          : ''
    if (id === undefined || id <= 0 || !typeName.trim()) continue

    const postCount = toInt(o.postCount ?? o.post_count)
    const totalPostCount = toInt(o.totalPostCount ?? o.total_post_count)
    const icon =
      o.icon === null || o.icon === undefined
        ? null
        : typeof o.icon === 'string'
          ? o.icon
          : String(o.icon)

    out.push({
      id,
      typeName: typeName.trim(),
      postCount,
      totalPostCount,
      icon,
    })
  }
  return out
}

export type BlogPostBySlugResponse = {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  contentHtml?: string | null
  publishDate?: string | null
  /** Translation row create time when `publishDate` is unset. */
  createdAt?: string | null
  metaDescription?: string | null
  post?: {
    id: number
    category?: { id: number; typeName: string } | null
    publishDate?: string | null
    createdAt?: string | null
  }
}

export type PostTranslationPublic = {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  publishDate?: string | null
  post?: { id: number }
}

export type CategoryFacetTag = {
  id: number
  name: string
  slug: string
  /** Published translations in this category tree (same language) that use this tag. */
  articleCount: number
}

export type CategoryPostsFlatResponse = {
  categoryId: number
  categoryName: string
  categoryIcon: string | null
  /** Distinct tags across the whole category tree (`language`); not narrowed by `tagSlugs` filter. */
  facetTags: CategoryFacetTag[]
  /** Raw rows from the API (entities); normalized on the client via `normalizeFlatPostRow`. */
  posts: unknown[]
  pagination: { page: number; limit: number; total: number }
}

export type TagPostsFlatResponse = {
  tagId: number
  tagName: string
  tagSlug: string
  posts: unknown[]
  pagination: { page: number; limit: number; total: number }
}

function toFiniteNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function parseCategoryFacetTags(data: Record<string, unknown>): CategoryFacetTag[] {
  const raw = data.facetTags ?? data.facet_tags
  if (!Array.isArray(raw)) return []

  const out: CategoryFacetTag[] = []
  for (const item of raw) {
    if (item == null || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = toFiniteNumber(o.id)
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const slug = typeof o.slug === 'string' ? o.slug.trim() : ''
    const ac = toFiniteNumber(o.articleCount ?? o.article_count) ?? 0
    if (id === undefined || id <= 0 || !name) continue
    out.push({
      id,
      name,
      slug: slug || name,
      articleCount: ac >= 0 ? ac : 0,
    })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

/** Accept Nest/JSON variants where ids/totals may arrive as strings. */
function parseCategoryPostsFlatJson(body: unknown): CategoryPostsFlatResponse | null {
  if (!body || typeof body !== 'object') return null
  const data = body as Record<string, unknown>

  const categoryId = toFiniteNumber(data.categoryId)
  if (categoryId === undefined || categoryId <= 0) return null

  const categoryName = data.categoryName
  if (typeof categoryName !== 'string' || !categoryName.trim()) return null

  const iconRaw = data.categoryIcon ?? data.category_icon
  const categoryIcon =
    iconRaw === null || iconRaw === undefined || String(iconRaw).trim() === ''
      ? null
      : String(iconRaw).trim()

  const pag = data.pagination
  if (!pag || typeof pag !== 'object') return null
  const pr = pag as Record<string, unknown>
  const total = toFiniteNumber(pr.total)
  if (total === undefined || total < 0) return null

  const page = toFiniteNumber(pr.page) ?? 1
  const limit = toFiniteNumber(pr.limit) ?? 10

  const posts = Array.isArray(data.posts) ? data.posts : []
  const facetTags = parseCategoryFacetTags(data)

  return {
    categoryId,
    categoryName,
    categoryIcon,
    facetTags,
    posts,
    pagination: { page, limit, total },
  }
}

function parseTagPostsFlatJson(body: unknown): TagPostsFlatResponse | null {
  if (!body || typeof body !== 'object') return null
  const data = body as Record<string, unknown>

  const tagId = toFiniteNumber(data.tagId ?? data.tag_id)
  if (tagId === undefined || tagId <= 0) return null

  const tagNameRaw = data.tagName ?? data.tag_name
  if (typeof tagNameRaw !== 'string' || !tagNameRaw.trim()) return null

  const tagSlugRaw = data.tagSlug ?? data.tag_slug
  const tagSlug = typeof tagSlugRaw === 'string' && tagSlugRaw.trim() ? tagSlugRaw.trim() : ''

  const pag = data.pagination
  if (!pag || typeof pag !== 'object') return null
  const pr = pag as Record<string, unknown>
  const total = toFiniteNumber(pr.total)
  if (total === undefined || total < 0) return null

  const page = toFiniteNumber(pr.page) ?? 1
  const limit = toFiniteNumber(pr.limit) ?? 10

  const posts = Array.isArray(data.posts) ? data.posts : []

  return {
    tagId,
    tagName: tagNameRaw.trim(),
    tagSlug,
    posts,
    pagination: { page, limit, total },
  }
}

const DEFAULT_BASE_URL = 'https://api.propertycareapp.com'

function getBaseUrl(): string {
  return (
    process.env.BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    DEFAULT_BASE_URL
  )
}

function getApiKey(): string | undefined {
  return process.env.SUBSCRIPTION_API_KEY?.trim()
}

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

function debugLog(message: string, meta?: Record<string, unknown>): void {
  if (!isDev()) return
  if (meta) console.log(`[blog-api] ${message}`, meta)
  else console.log(`[blog-api] ${message}`)
}

/** Public asset base for category icons from API filenames. */
export function publicAssetBaseUrlForBlogMedia(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL_PHOTO?.trim()
  if (!raw) return ''
  return raw.endsWith('/') ? raw : `${raw}/`
}

/** Resolve post cover / OG image filename or absolute URL (same base as category SVGs when relative). */
export function resolveBlogMediaUrl(file: string | null | undefined): string | null {
  const f = file?.trim()
  if (!f) return null
  if (f.startsWith('http://') || f.startsWith('https://')) return f
  const base = publicAssetBaseUrlForBlogMedia()
  if (!base) return null
  return `${base}${f.replace(/^\//, '')}`
}

export function resolveBlogCategoryIconUrl(icon: string | null | undefined): string | null {
  return resolveBlogMediaUrl(icon)
}

export async function getBlogCategoriesByParent(parentId: number | null): Promise<BlogCategory[]> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  if (!apiKey) {
    debugLog('missing SUBSCRIPTION_API_KEY; skipping categories fetch')
    return []
  }

  const url = new URL('/public/blog/categories', baseUrl)
  if (parentId !== null) {
    url.searchParams.set('parentId', String(parentId))
  }
  debugLog('fetching categories', { url: url.toString(), parentId })

  try {
    const response = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      debugLog('categories fetch failed', { status: response.status, statusText: response.statusText })
      return []
    }

    const data = (await response.json()) as unknown
    if (!Array.isArray(data)) {
      debugLog('categories response is not an array')
      return []
    }

    debugLog('categories fetched successfully', { count: data.length })
    return normalizePublicCategoryList(data)
  } catch (error) {
    debugLog('categories fetch threw an error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return []
  }
}

type LitePostsResponse = {
  posts: Array<{
    post: { category: { id: number | null; typeName: string | null } }
  }>
}

/**
 * Same logic as Pikgo `getBlogListCategories`:
 * subcategories of parent, or a single synthetic card when posts live on the parent type only.
 */
export async function getBlogListCategories(parentId: number, language?: string): Promise<BlogCategory[]> {
  const lang = language ?? getBlogLanguage()
  const sub = await getBlogCategoriesByParent(parentId)
  if (sub.length > 0) {
    return sub
  }

  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()
  if (!apiKey) {
    debugLog('getBlogListCategories: missing SUBSCRIPTION_API_KEY; cannot load fallback')
    return []
  }

  const langCandidates = [lang, lang.toLowerCase()].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  )

  try {
    let posts: LitePostsResponse['posts'] = []

    for (const lg of langCandidates) {
      const url = new URL(`/public/blog/posts/by-category-lite/${parentId}`, baseUrl)
      url.searchParams.set('language', lg)
      const response = await fetch(url.toString(), {
        headers: { 'x-api-key': apiKey },
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        debugLog('getBlogListCategories: lite posts failed', {
          status: response.status,
          parentId,
          language: lg,
        })
        continue
      }

      const data = (await response.json()) as LitePostsResponse
      const nextPosts = data.posts ?? []
      if (nextPosts.length > 0) {
        posts = nextPosts
        break
      }
    }

    if (posts.length === 0) {
      debugLog('getBlogListCategories: no subcategories and no posts for parent', { parentId })
      return []
    }

    const first = posts[0]!
    const typeName = first.post?.category?.typeName?.trim() || 'Help Center'

    return [
      {
        id: parentId,
        typeName,
        totalPostCount: posts.length,
        postCount: posts.length,
        icon: null,
        children: [],
      },
    ]
  } catch (error) {
    debugLog('getBlogListCategories: lite fetch error', {
      error: error instanceof Error ? error.message : String(error),
      parentId,
    })
    return []
  }
}

type FetchCategoryFlatOne =
  | { ok: true; data: CategoryPostsFlatResponse }
  | {
      ok: false
      reason:
        | 'not_found'
        | 'no_api_key'
        | 'bad_json'
        | 'parse_failed'
        | 'bad_request'
        | 'http'
      httpStatus?: number
      message?: string
    }

async function fetchCategoryPostsFlatPage(
  categoryId: number,
  lang: string,
  page: number,
  limit: number,
  filter?: { tagSlugs?: string[]; tagMatch?: 'all' | 'any' },
): Promise<FetchCategoryFlatOne> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()
  if (!apiKey) return { ok: false, reason: 'no_api_key' }

  const url = new URL(`/public/blog/posts/by-category/${categoryId}`, baseUrl)
  url.searchParams.set('language', lang)
  url.searchParams.set('flat', '1')
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))

  const slugs = (filter?.tagSlugs ?? []).map((s) => s.trim()).filter(Boolean)
  if (slugs.length) {
    url.searchParams.set('tagSlugs', [...new Set(slugs)].join(','))
    const match = filter?.tagMatch === 'all' ? 'all' : 'any'
    url.searchParams.set('tagMatch', match)
  }

  let response: Response
  try {
    response = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 },
    })
  } catch (error) {
    debugLog('getCategoryPostsFlatPaged: network error', {
      categoryId,
      language: lang,
      error: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, reason: 'http', httpStatus: 0 }
  }

  if (response.status === 404) return { ok: false, reason: 'not_found' }
  if (response.status === 400) {
    let message = 'Invalid tag filter.'
    try {
      const body = (await response.json()) as { message?: unknown }
      if (typeof body?.message === 'string' && body.message.trim()) message = body.message.trim()
    } catch {
      /* ignore */
    }
    return { ok: false, reason: 'bad_request', httpStatus: 400, message }
  }
  if (!response.ok) {
    debugLog('getCategoryPostsFlatPaged: request failed', {
      status: response.status,
      categoryId,
      language: lang,
      page,
    })
    return { ok: false, reason: 'http', httpStatus: response.status }
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    debugLog('getCategoryPostsFlatPaged: invalid JSON body', { categoryId })
    return { ok: false, reason: 'bad_json' }
  }

  const parsed = parseCategoryPostsFlatJson(json)
  if (!parsed) {
    debugLog('getCategoryPostsFlatPaged: response shape not recognized', {
      categoryId,
      keys: json && typeof json === 'object' ? Object.keys(json as object) : [],
    })
    return { ok: false, reason: 'parse_failed' }
  }
  return { ok: true, data: parsed }
}

export type CategoryPostsFlatRouteResult =
  | { status: 'ok'; data: CategoryPostsFlatResponse }
  | { status: 'not_found' }
  | { status: 'bad_request'; message: string }
  | { status: 'error'; message: string }

export type CategoryPostsFlatFilterOpts = {
  tagSlugs?: string[]
  tagMatch?: 'all' | 'any'
}

/** Use from route handlers to distinguish real 404 vs misconfiguration / network issues. */
export async function getCategoryPostsFlatForRoute(
  categoryId: number,
  page: number,
  pageSize: number,
  language?: string,
  filter?: CategoryPostsFlatFilterOpts,
): Promise<CategoryPostsFlatRouteResult> {
  const lang = language ?? getBlogLanguage()
  const langCandidates = [lang, lang.toLowerCase()].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  )

  const attempts: FetchCategoryFlatOne[] = []

  for (const lg of langCandidates) {
    try {
      const r = await fetchCategoryPostsFlatPage(categoryId, lg, page, pageSize, filter)
      attempts.push(r)
      if (r.ok) return { status: 'ok', data: r.data }
      if (r.reason === 'bad_request') {
        return { status: 'bad_request', message: r.message ?? 'Invalid tag filter.' }
      }
    } catch (error) {
      debugLog('getCategoryPostsFlatForRoute: unexpected throw', {
        categoryId,
        error: error instanceof Error ? error.message : String(error),
      })
      attempts.push({ ok: false, reason: 'http', httpStatus: 0 })
    }
  }

  if (attempts.some((a) => a.ok === false && a.reason === 'no_api_key')) {
    return {
      status: 'error',
      message:
        'Missing SUBSCRIPTION_API_KEY. Add it to .env so the blog API can authorize requests.',
    }
  }

  const onlyNotFound =
    attempts.length > 0 && attempts.every((a) => a.ok === false && a.reason === 'not_found')
  if (onlyNotFound) return { status: 'not_found' }

  const baseUrl = getBaseUrl()
  return {
    status: 'error',
    message: `Unable to load category ${categoryId}. Check that BASE_URL (${baseUrl}) reaches your PropertyCare API and the subscription key is valid. Open the terminal running next dev for [blog-api] logs.`,
  }
}

export async function getCategoryPostsFlatPaged(
  categoryId: number,
  page: number,
  pageSize: number,
  language?: string,
): Promise<CategoryPostsFlatResponse | null> {
  const result = await getCategoryPostsFlatForRoute(categoryId, page, pageSize, language)
  return result.status === 'ok' ? result.data : null
}

type FetchTagFlatOne =
  | { ok: true; data: TagPostsFlatResponse }
  | { ok: false; reason: 'not_found' | 'no_api_key' | 'bad_json' | 'parse_failed' | 'http'; httpStatus?: number }

async function fetchTagPostsFlatPage(
  tagSlug: string,
  lang: string,
  page: number,
  limit: number,
): Promise<FetchTagFlatOne> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()
  if (!apiKey) return { ok: false, reason: 'no_api_key' }

  const pathSlug = encodeURIComponent(tagSlug.trim())
  const url = new URL(`/public/blog/posts/by-tag-slug/${pathSlug}`, baseUrl)
  url.searchParams.set('language', lang)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))

  let response: Response
  try {
    response = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 },
    })
  } catch (error) {
    debugLog('fetchTagPostsFlatPage: network error', {
      tagSlug,
      language: lang,
      error: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, reason: 'http', httpStatus: 0 }
  }

  if (response.status === 404) return { ok: false, reason: 'not_found' }
  if (!response.ok) {
    debugLog('fetchTagPostsFlatPage: request failed', {
      status: response.status,
      tagSlug,
      language: lang,
      page,
    })
    return { ok: false, reason: 'http', httpStatus: response.status }
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    debugLog('fetchTagPostsFlatPage: invalid JSON body', { tagSlug })
    return { ok: false, reason: 'bad_json' }
  }

  const parsed = parseTagPostsFlatJson(json)
  if (!parsed) {
    debugLog('fetchTagPostsFlatPage: response shape not recognized', {
      tagSlug,
      keys: json && typeof json === 'object' ? Object.keys(json as object) : [],
    })
    return { ok: false, reason: 'parse_failed' }
  }
  return { ok: true, data: parsed }
}

export type TagPostsFlatRouteResult =
  | { status: 'ok'; data: TagPostsFlatResponse }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

export async function getTagPostsFlatForRoute(
  tagSlug: string,
  page: number,
  pageSize: number,
  language?: string,
): Promise<TagPostsFlatRouteResult> {
  const trimmed = tagSlug.trim()
  if (!trimmed) return { status: 'not_found' }

  const lang = language ?? getBlogLanguage()
  const langCandidates = [lang, lang.toLowerCase()].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  )

  const attempts: FetchTagFlatOne[] = []

  for (const lg of langCandidates) {
    try {
      const r = await fetchTagPostsFlatPage(trimmed, lg, page, pageSize)
      attempts.push(r)
      if (r.ok) return { status: 'ok', data: r.data }
    } catch (error) {
      debugLog('getTagPostsFlatForRoute: unexpected throw', {
        tagSlug: trimmed,
        error: error instanceof Error ? error.message : String(error),
      })
      attempts.push({ ok: false, reason: 'http', httpStatus: 0 })
    }
  }

  if (attempts.some((a) => a.ok === false && a.reason === 'no_api_key')) {
    return {
      status: 'error',
      message:
        'Missing SUBSCRIPTION_API_KEY. Add it to .env so the blog API can authorize requests.',
    }
  }

  const onlyNotFound =
    attempts.length > 0 && attempts.every((a) => a.ok === false && a.reason === 'not_found')
  if (onlyNotFound) return { status: 'not_found' }

  const baseUrl = getBaseUrl()
  return {
    status: 'error',
    message: `Unable to load tag “${trimmed}”. Deploy the backend route GET /public/blog/posts/by-tag-slug/:tagSlug, check BASE_URL (${baseUrl}), and subscription key. See [blog-api] logs.`,
  }
}

export async function getBlogPostBySlug(
  slug: string,
  language?: string,
): Promise<BlogPostBySlugResponse | null> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  if (!apiKey || !slug.trim()) {
    debugLog('getBlogPostBySlug: missing key or slug')
    return null
  }

  const lang = language ?? getBlogLanguage()
  const langCandidates = [lang, lang.toLowerCase()].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  )

  const pathSlug = encodeURIComponent(slug.trim())

  for (const lg of langCandidates) {
    const url = new URL(`/public/blog/posts/by-slug/${pathSlug}`, baseUrl)
    url.searchParams.set('language', lg)

    try {
      const response = await fetch(url.toString(), {
        headers: { 'x-api-key': apiKey },
        next: { revalidate: 300 },
      })

      if (response.status === 404) return null

      if (!response.ok) {
        debugLog('getBlogPostBySlug: request failed', {
          status: response.status,
          slug,
          language: lg,
        })
        continue
      }

      const data = (await response.json()) as BlogPostBySlugResponse
      if (data && typeof data.title === 'string' && typeof data.slug === 'string') {
        return data
      }
    } catch (error) {
      debugLog('getBlogPostBySlug: fetch error', {
        error: error instanceof Error ? error.message : String(error),
        slug,
      })
    }
  }

  return null
}

/**
 * Related published translations for a blog post (`post.id`), same language.
 * `GET /public/blog/posts/:postId/related`
 */
export async function getBlogRelatedPosts(postId: number, language?: string): Promise<unknown[]> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()
  if (!apiKey || !Number.isFinite(postId) || postId <= 0) {
    debugLog('getBlogRelatedPosts: missing key or postId')
    return []
  }

  const lang = language ?? getBlogLanguage()
  const langCandidates = [lang, lang.toLowerCase()].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  )

  for (const lg of langCandidates) {
    const url = new URL(`/public/blog/posts/${postId}/related`, baseUrl)
    url.searchParams.set('language', lg)

    try {
      const response = await fetch(url.toString(), {
        headers: { 'x-api-key': apiKey },
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        debugLog('getBlogRelatedPosts: request failed', { status: response.status, postId, language: lg })
        continue
      }

      const data = (await response.json()) as unknown
      return Array.isArray(data) ? data : []
    } catch (error) {
      debugLog('getBlogRelatedPosts: fetch error', {
        postId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return []
}
