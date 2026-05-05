/** Base URL for canonicals, OG URLs, and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (url) return url.replace(/\/$/, '')
  return 'http://localhost:3000'
}

export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'HelpCenter'
}

/** Default `<title>` / OG / Twitter for the site (link previews). Override with `NEXT_PUBLIC_SITE_DEFAULT_TITLE`. */
export function getSiteDefaultTitle(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_DEFAULT_TITLE?.trim()
  if (fromEnv) return fromEnv
  return `${getSiteName()} — Knowledge Base & Blog`
}

/** Default meta description (link previews). Override with `NEXT_PUBLIC_SITE_DEFAULT_DESCRIPTION`. */
export function getSiteDefaultDescription(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_DEFAULT_DESCRIPTION?.trim()
  if (fromEnv) return fromEnv
  return 'Search our knowledge base to find answers, tutorials, and best practices.'
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
