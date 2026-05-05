import { Link } from '@/i18n/navigation'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { CategoryApiPage } from '@/components/category-api-page'
import { CategoryStaticPage } from '@/components/category-static-page'
import { getCategoryBySlug } from '@/lib/blog-data'
import { getBlogListCategories, getCategoryPostsFlatForRoute } from '@/lib/blog-api'
import { getBlogLanguage, getBlogRootCategoryId } from '@/lib/blog-env'
import { normalizeFlatPostRow } from '@/lib/category-post-utils'
import { localePath } from '@/lib/locale-path'
import { absoluteUrl, getSiteName } from '@/lib/site'
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/json-ld'
import {
  buildCategoryListHref,
  parseBlogListPage,
  parseCategoryTagMatchParam,
  parseCategoryTagSlugsParam,
  totalListPages,
} from '@/lib/blog-list-paging'
import { getTranslations, setRequestLocale } from 'next-intl/server'

const CATEGORY_PAGE_SIZE = 5

type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamicParams = true

export const revalidate = 300

async function CategoryRouteError({
  categoryId,
  message,
  locale,
}: {
  categoryId: number
  message: string
  locale: string
}) {
  const t = await getTranslations('Category')
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground text-center">{t('couldNotLoad')}</h1>
      <p className="mt-3 text-sm text-muted-foreground text-center max-w-lg">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t('categoryId', { id: categoryId })}</p>
      <Link href="/" className="mt-8 text-accent underline hover:no-underline">
        {t('backHome')}
      </Link>
    </div>
  )
}

function isPositiveIntSlug(slug: string): number | null {
  const trimmed = slug.trim()
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n <= 0) return null
  return String(n) === trimmed ? n : null
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const tCat = await getTranslations({ locale, namespace: 'Category' })
  const tErr = await getTranslations({ locale, namespace: 'Errors' })
  const categoryId = isPositiveIntSlug(slug)

  if (categoryId != null) {
    const lang = getBlogLanguage()
    const sp = await searchParams
    const page = parseBlogListPage(sp)
    const tagSlugs = parseCategoryTagSlugsParam(sp)
    const tagMatch = parseCategoryTagMatchParam(sp)
    const flat = await getCategoryPostsFlatForRoute(categoryId, page, CATEGORY_PAGE_SIZE, lang, {
      tagSlugs: tagSlugs.length ? tagSlugs : undefined,
      tagMatch,
    })
    if (flat.status !== 'ok') return { title: tErr('category') }

    const data = flat.data
    const path = localePath(locale, `/category/${categoryId}`)
    const canonical = absoluteUrl(
      buildCategoryListHref(path, {
        page: page > 1 ? page : undefined,
        tagSlugs: tagSlugs.length ? tagSlugs : undefined,
        tagMatch,
      }),
    )
    const siteName = getSiteName()
    const title =
      page > 1
        ? tCat('titlePage', { name: data.categoryName, page })
        : tCat('titleSingle', { name: data.categoryName })
    const description = tCat('descriptionCount', {
      name: data.categoryName,
      count: data.pagination.total,
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

  const category = getCategoryBySlug(slug)
  if (!category) return { title: tCat('notFound') }

  const canonical = absoluteUrl(localePath(locale, `/category/${category.slug}`))
  const siteName = getSiteName()
  const title = `${category.title} — ${tCat('titleSuffix')}`
  return {
    title,
    description: category.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: category.description,
      url: canonical,
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: category.description,
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' })
  const homeLabel = tMeta('breadcrumbHome')

  const categoryId = isPositiveIntSlug(slug)

  if (categoryId != null) {
    const lang = getBlogLanguage()
    const rootId = getBlogRootCategoryId()
    const sp = await searchParams
    const requestedPage = parseBlogListPage(sp)
    const tagSlugs = parseCategoryTagSlugsParam(sp)
    const tagMatch = parseCategoryTagMatchParam(sp)

    const flat = await getCategoryPostsFlatForRoute(categoryId, requestedPage, CATEGORY_PAGE_SIZE, lang, {
      tagSlugs: tagSlugs.length ? tagSlugs : undefined,
      tagMatch,
    })
    if (flat.status === 'not_found') notFound()
    if (flat.status === 'bad_request') {
      return <CategoryRouteError categoryId={categoryId} message={flat.message} locale={locale} />
    }
    if (flat.status === 'error') {
      return <CategoryRouteError categoryId={categoryId} message={flat.message} locale={locale} />
    }

    const data = flat.data
    const listBasePath = localePath(locale, `/category/${categoryId}`)
    const totalPages = totalListPages(data.pagination.total, data.pagination.limit)
    if (requestedPage > totalPages) {
      redirect(
        buildCategoryListHref(listBasePath, {
          page: totalPages > 1 ? totalPages : undefined,
          tagSlugs: tagSlugs.length ? tagSlugs : undefined,
          tagMatch,
        }),
      )
    }

    const normalizedPosts = data.posts
      .map((raw) => normalizeFlatPostRow(raw, data.categoryName))
      .filter((p) => p.slug.trim().length > 0 && p.id > 0)

    const siblingCategories =
      rootId > 0 ? await getBlogListCategories(rootId, lang) : []

    const path = localePath(locale, `/category/${categoryId}`)
    const tCat = await getTranslations({ locale, namespace: 'Category' })
    const description = tCat('descriptionCount', {
      name: data.categoryName,
      count: data.pagination.total,
    })

    return (
      <>
        <WebPageJsonLd name={data.categoryName} description={description} path={path} />
        <BreadcrumbJsonLd
          items={[
            { name: homeLabel, path: localePath(locale, '/') },
            { name: data.categoryName, path },
          ]}
        />
        <CategoryApiPage
          data={data}
          normalizedPosts={normalizedPosts}
          siblingCategories={siblingCategories}
          currentCategoryId={categoryId}
          listBasePath={listBasePath}
          selectedTagSlugs={tagSlugs}
          tagMatch={tagMatch}
        />
      </>
    )
  }

  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const path = localePath(locale, `/category/${slug}`)
  return (
    <>
      <WebPageJsonLd name={category.title} description={category.description} path={path} />
      <BreadcrumbJsonLd
        items={[
          { name: homeLabel, path: localePath(locale, '/') },
          { name: category.title, path },
        ]}
      />
      <CategoryStaticPage category={category} slug={slug} />
    </>
  )
}
