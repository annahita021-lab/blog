import { getCategoryBySlug } from '@/lib/blog-data'

/** Language code sent to PropertyCare blog APIs (often uppercase, e.g. EN, FI). */
export function getBlogLanguage(): string {
  const raw = process.env.BLOG_DEFAULT_LANGUAGE?.trim()
  return raw ? raw.toUpperCase() : 'EN'
}

/** Root Help Center / blog folder id (`BLOG_CATEGORY_ID`); child types render on the home grid. */
export function getBlogRootCategoryId(): number {
  const n = Number(process.env.BLOG_CATEGORY_ID ?? '0')
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * Breadcrumb / back link: numeric id → `/category/[id]`; known demo slug → `/category/[slug]`; else home.
 */
export function categoryBrowseHref(categorySlug: string): string {
  const trimmed = categorySlug.trim()
  const n = Number.parseInt(trimmed, 10)
  if (Number.isFinite(n) && n > 0 && String(n) === trimmed) {
    return `/category/${n}`
  }
  if (getCategoryBySlug(trimmed)) {
    return `/category/${trimmed}`
  }
  return '/'
}
