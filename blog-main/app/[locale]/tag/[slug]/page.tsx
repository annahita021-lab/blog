import { Link } from '@/i18n/navigation'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTagPostsFlatForRoute } from '@/lib/blog-api'
import { getBlogLanguage } from '@/lib/blog-env'
import { normalizeFlatPostRow } from '@/lib/category-post-utils'
import { localePath } from '@/lib/locale-path'
import { absoluteUrl, getSiteName } from '@/lib/site'
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/json-ld'
import { TagApiPage } from '@/components/tag-api-page'
import { parseBlogListPage, totalListPages } from '@/lib/blog-list-paging'
import { getTranslations, setRequestLocale } from 'next-intl/server'

const TAG_PAGE_SIZE = 5

type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamicParams = true

async function TagRouteError({
  tagSlug,
  message,
  locale,
}: {
  tagSlug: string
  message: string
  locale: string
}) {
  const t = await getTranslations('Tag')
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground text-center">{t('couldNotLoad')}</h1>
      <p className="mt-3 text-sm text-muted-foreground text-center max-w-lg">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t('tagSlug', { slug: tagSlug })}</p>
      <Link href="/" className="mt-8 text-accent underline hover:no-underline">
        {t('backHome')}
      </Link>
    </div>
  )
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug: raw, locale } = await params
  const slug = decodeURIComponent(raw)
  const lang = getBlogLanguage()
  const page = parseBlogListPage(await searchParams)
  const flat = await getTagPostsFlatForRoute(slug, page, TAG_PAGE_SIZE, lang)
  const tTag = await getTranslations({ locale, namespace: 'Tag' })
  const tErr = await getTranslations({ locale, namespace: 'Errors' })
  if (flat.status !== 'ok') return { title: tErr('tag') }

  const data = flat.data
  const pathSegment = encodeURIComponent(slug.trim())
  const pathOnly = localePath(locale, `/tag/${pathSegment}`)
  const canonical = absoluteUrl(page <= 1 ? pathOnly : `${pathOnly}?page=${page}`)
  const siteName = getSiteName()
  const title =
    page > 1 ? tTag('titlePage', { name: data.tagName, page }) : tTag('titleSingle', { name: data.tagName })
  const description = tTag('descriptionTagged', {
    name: data.tagName,
    count: data.pagination.total,
    tag: data.tagName,
  })

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug: raw, locale } = await params
  const slug = decodeURIComponent(raw).trim()
  if (!slug) notFound()

  setRequestLocale(locale)
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' })
  const homeLabel = tMeta('breadcrumbHome')

  const lang = getBlogLanguage()
  const requestedPage = parseBlogListPage(await searchParams)
  const flat = await getTagPostsFlatForRoute(slug, requestedPage, TAG_PAGE_SIZE, lang)

  if (flat.status === 'not_found') notFound()
  if (flat.status === 'error') {
    return <TagRouteError tagSlug={slug} message={flat.message} locale={locale} />
  }

  const data = flat.data
  const listBasePath = localePath(locale, `/tag/${encodeURIComponent(slug)}`)
  const totalPages = totalListPages(data.pagination.total, data.pagination.limit)
  if (requestedPage > totalPages) {
    redirect(totalPages <= 1 ? listBasePath : `${listBasePath}?page=${totalPages}`)
  }

  const normalizedPosts = data.posts
    .map((rawRow) => normalizeFlatPostRow(rawRow))
    .filter((p) => p.slug.trim().length > 0 && p.id > 0)

  const path = localePath(locale, `/tag/${encodeURIComponent(slug)}`)
  const tTag = await getTranslations({ locale, namespace: 'Tag' })
  const description = tTag('descriptionTagged', {
    name: data.tagName,
    count: data.pagination.total,
    tag: data.tagName,
  })

  return (
    <>
      <WebPageJsonLd
        name={tTag('tagJsonName', { name: data.tagName })}
        description={description}
        path={path}
      />
      <BreadcrumbJsonLd
        items={[
          { name: homeLabel, path: localePath(locale, '/') },
          { name: data.tagName, path },
        ]}
      />
      <TagApiPage
        data={data}
        normalizedPosts={normalizedPosts}
        routeTagSlug={slug}
        listBasePath={listBasePath}
      />
    </>
  )
}
