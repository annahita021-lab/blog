import type { Article } from '@/lib/blog-data'
import { absoluteUrl } from '@/lib/site'

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function OrganizationJsonLd({
  siteUrl,
  siteName,
  logoPath,
}: {
  siteUrl: string
  siteName: string
  logoPath: string
}) {
  const logoUrl = absoluteUrl(logoPath)
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
      }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  )
}

export function ArticleJsonLd({
  article,
  canonicalUrl,
  siteUrl,
}: {
  article: Article
  canonicalUrl: string
  siteUrl: string
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        image: [article.image],
        datePublished: article.date,
        dateModified: article.date,
        author: {
          '@type': 'Person',
          name: article.author,
        },
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      }}
    />
  )
}

export function WebPageJsonLd({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}) {
  const url = absoluteUrl(path)
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        description,
        url,
      }}
    />
  )
}
