/** Path with locale prefix for canonical URLs and JSON-LD (e.g. `/en/article/foo`). */
export function localePath(locale: string, pathname: string): string {
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (p === '/') return `/${locale}`
  return `/${locale}${p}`
}
