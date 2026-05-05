import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Article } from '@/lib/blog-data'
import type { BlogPostBySlugResponse } from '@/lib/blog-api'
import { getBlogPostBySlug, getBlogRelatedPosts, getCategoryPostsFlatForRoute } from '@/lib/blog-api'
import { articles, getArticleBySlug, getRelatedArticles } from '@/lib/blog-data'
import {
  ensureHtmlHeadingIds,
  extractHeadings,
  extractHeadingsFromHtml,
  parseArticleMarkdown,
} from '@/lib/article-markdown'
import { normalizeFlatPostRow } from '@/lib/category-post-utils'
import { categoryBrowseHref, getBlogLanguage } from '@/lib/blog-env'
import { localePath } from '@/lib/locale-path'
import { absoluteUrl, getSiteName, getSiteUrl } from '@/lib/site'
import { ArticlePageClient } from '@/components/article-page-client'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = { params: Promise<{ locale: string; slug: string }> }

const API_ARTICLE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'

const SIDEBAR_RELATED_POOL = 28

async function loadSidebarRelatedRows(
  apiPost: BlogPostBySlugResponse,
  article: Article,
  lang: string,
  tArticle: (key: 'relatedArticles' | 'moreInCategory') => string,
): Promise<{ rows: unknown[]; relatedSectionTitle: string }> {
  const postId = apiPost.post?.id
  const categoryId = apiPost.post?.category?.id

  if (postId != null && postId > 0) {
    const fromEditor = await getBlogRelatedPosts(postId, lang)
    if (fromEditor.length > 0) {
      return { rows: fromEditor, relatedSectionTitle: tArticle('relatedArticles') }
    }
  }

  if (categoryId != null && categoryId > 0) {
    const flat = await getCategoryPostsFlatForRoute(categoryId, 1, SIDEBAR_RELATED_POOL, lang)
    if (flat.status === 'ok') {
      const seen = new Set<string>()
      const rows: unknown[] = []
      for (const row of flat.data.posts) {
        const card = normalizeFlatPostRow(row, article.category)
        if (!card.slug.trim() || card.slug === article.slug) continue
        if (seen.has(card.slug)) continue
        seen.add(card.slug)
        rows.push(row)
        if (rows.length >= 4) break
      }
      return { rows, relatedSectionTitle: tArticle('moreInCategory') }
    }
  }

  return { rows: [], relatedSectionTitle: tArticle('relatedArticles') }
}

function relatedApiRowToArticle(
  row: unknown,
  category: string,
  categorySlug: string,
  fallbackImage: string,
): Article | null {
  const card = normalizeFlatPostRow(row, category)
  if (!card.slug.trim() || !card.id) return null
  return {
    id: String(card.id),
    title: card.title,
    excerpt: card.excerpt ?? '',
    content: '',
    image: card.imageUrl ?? fallbackImage,
    category,
    categorySlug,
    author: 'Property Care App',
    date: card.publishDate ?? new Date().toISOString().slice(0, 10),
    readTime: '',
    roles: [],
    slug: card.slug,
  }
}

function apiPostToArticle(post: BlogPostBySlugResponse): Article {
  const catId = post.post?.category?.id
  const displayDate =
    post.publishDate?.trim() ||
    post.createdAt?.trim() ||
    post.post?.publishDate?.trim() ||
    post.post?.createdAt?.trim() ||
    new Date().toISOString().slice(0, 10)
  return {
    id: String(post.id),
    title: post.title,
    excerpt: post.excerpt ?? post.metaDescription ?? '',
    content: '',
    image: API_ARTICLE_FALLBACK_IMAGE,
    category: post.post?.category?.typeName ?? 'Blog',
    categorySlug: catId != null ? String(catId) : 'blog',
    author: 'Property Care App',
    date: displayDate,
    readTime: '',
    roles: [],
    slug: post.slug,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const lang = getBlogLanguage()
  const apiPost = await getBlogPostBySlug(slug, lang)
  const tErr = await getTranslations({ locale, namespace: 'Errors' })

  if (apiPost) {
    const canonical = absoluteUrl(localePath(locale, `/article/${apiPost.slug}`))
    const siteName = getSiteName()
    const description = apiPost.excerpt ?? apiPost.metaDescription ?? ''
    const pub =
      apiPost.publishDate?.trim() ||
      apiPost.createdAt?.trim() ||
      apiPost.post?.publishDate?.trim() ||
      apiPost.post?.createdAt?.trim() ||
      undefined
    return {
      title: apiPost.title,
      description,
      alternates: { canonical },
      openGraph: {
        title: apiPost.title,
        description,
        url: canonical,
        siteName,
        type: 'article',
        publishedTime: pub,
        modifiedTime: pub,
        images: [{ url: API_ARTICLE_FALLBACK_IMAGE, width: 1200, height: 800 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: apiPost.title,
        description,
        images: [API_ARTICLE_FALLBACK_IMAGE],
      },
    }
  }

  const article = getArticleBySlug(slug)
  if (!article) return { title: tErr('articleNotFound') }

  const canonical = absoluteUrl(localePath(locale, `/article/${article.slug}`))
  const siteName = getSiteName()
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonical,
      siteName,
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.date,
      images: [{ url: article.image, width: 800, height: 400 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const lang = getBlogLanguage()
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' })
  const tArticle = await getTranslations('Article')
  const homeLabel = tMeta('breadcrumbHome')

  const apiPost = await getBlogPostBySlug(slug, lang)

  if (apiPost) {
    const article = apiPostToArticle(apiPost)
    let htmlContent = apiPost.contentHtml?.trim()
      ? apiPost.contentHtml
      : `<p class="text-muted-foreground">${tArticle('noContent')}</p>`
    htmlContent = ensureHtmlHeadingIds(htmlContent)
    const headings = extractHeadingsFromHtml(htmlContent)

    const { rows: rawRelated, relatedSectionTitle } = await loadSidebarRelatedRows(
      apiPost,
      article,
      lang,
      tArticle,
    )
    const relatedArticles = rawRelated
      .map((row) =>
        relatedApiRowToArticle(row, article.category, article.categorySlug, API_ARTICLE_FALLBACK_IMAGE),
      )
      .filter((a): a is Article => a != null && a.slug !== article.slug)
      .slice(0, 4)

    const siteUrl = getSiteUrl()
    const canonical = absoluteUrl(localePath(locale, `/article/${article.slug}`))
    const catPath = categoryBrowseHref(article.categorySlug)

    return (
      <>
        <ArticleJsonLd article={article} canonicalUrl={canonical} siteUrl={siteUrl} />
        <BreadcrumbJsonLd
          items={[
            { name: homeLabel, path: localePath(locale, '/') },
            { name: article.category, path: localePath(locale, catPath) },
            { name: article.title, path: localePath(locale, `/article/${article.slug}`) },
          ]}
        />
        <ArticlePageClient
          article={article}
          relatedArticles={relatedArticles}
          relatedSectionTitle={relatedSectionTitle}
          headings={headings}
          htmlContent={htmlContent}
        />
      </>
    )
  }

  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const relatedArticles = getRelatedArticles(slug, article.categorySlug, 4)
  const headings = extractHeadings(article.content)
  const htmlContent = parseArticleMarkdown(article.content)
  const siteUrl = getSiteUrl()
  const canonical = absoluteUrl(localePath(locale, `/article/${article.slug}`))
  const catPath = categoryBrowseHref(article.categorySlug)

  return (
    <>
      <ArticleJsonLd article={article} canonicalUrl={canonical} siteUrl={siteUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: homeLabel, path: localePath(locale, '/') },
          { name: article.category, path: localePath(locale, catPath) },
          { name: article.title, path: localePath(locale, `/article/${article.slug}`) },
        ]}
      />
      <ArticlePageClient
        article={article}
        relatedArticles={relatedArticles}
        relatedSectionTitle={tArticle('relatedArticles')}
        headings={headings}
        htmlContent={htmlContent}
      />
    </>
  )
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}
