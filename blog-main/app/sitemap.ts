import type { MetadataRoute } from 'next'
import { articles } from '@/lib/blog-data'
import { getBlogListCategories } from '@/lib/blog-api'
import { getBlogLanguage, getBlogRootCategoryId } from '@/lib/blog-env'
import { localePath } from '@/lib/locale-path'
import { absoluteUrl } from '@/lib/site'
import { routing } from '@/i18n/routing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rootId = getBlogRootCategoryId()
  const lang = getBlogLanguage()

  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    const home = absoluteUrl(localePath(locale, '/'))

    if (rootId > 0) {
      const apiCategories = await getBlogListCategories(rootId, lang)
      if (apiCategories.length > 0) {
        entries.push(
          {
            url: home,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
          },
          ...apiCategories.map((c) => ({
            url: absoluteUrl(localePath(locale, `/category/${c.id}`)),
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.85,
          })),
        )
        continue
      }
    }

    entries.push(
      {
        url: home,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
      ...articles.map((a) => ({
        url: absoluteUrl(localePath(locale, `/article/${a.slug}`)),
        lastModified: new Date(a.date),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
    )
  }

  return entries
}
