import { ArrowLeft, Rocket } from 'lucide-react'
import type { BlogCategory, CategoryPostsFlatResponse } from '@/lib/blog-api'
import { resolveBlogCategoryIconUrl } from '@/lib/blog-api'
import type { CategoryPostCard } from '@/lib/category-post-utils'
import { CategoryBrowseClient } from '@/components/category-browse-client'
import { BlogPagination } from '@/components/blog-pagination'
import { DocShellHeader } from '@/components/doc-shell-header'
import { SiteFooter } from '@/components/site-footer'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export async function CategoryApiPage({
  data,
  normalizedPosts,
  siblingCategories,
  currentCategoryId,
  listBasePath,
  selectedTagSlugs = [],
  tagMatch = 'any',
}: {
  data: CategoryPostsFlatResponse
  normalizedPosts: CategoryPostCard[]
  siblingCategories: BlogCategory[]
  currentCategoryId: number
  listBasePath: string
  selectedTagSlugs?: string[]
  tagMatch?: 'all' | 'any'
}) {
  const t = await getTranslations('Category')
  const iconFromList = siblingCategories.find((c) => c.id === currentCategoryId)?.icon ?? null
  const iconFilename =
    data.categoryIcon?.trim() || (typeof iconFromList === 'string' ? iconFromList.trim() : '') || null
  const iconSrc = resolveBlogCategoryIconUrl(iconFilename)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DocShellHeader />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToCategories')}
          </Link>
        </div>
      </div>

      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 flex gap-4 items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
            {iconSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconSrc} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <Rocket className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.categoryName}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('descriptionCount', { name: data.categoryName, count: data.pagination.total })}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        <CategoryBrowseClient
          siblingCategories={siblingCategories}
          currentCategoryId={currentCategoryId}
          posts={normalizedPosts}
          tagFilterMode="server"
          listBasePath={listBasePath}
          selectedTagSlugs={selectedTagSlugs}
          tagMatch={tagMatch}
          facetTags={data.facetTags}
        />
        <BlogPagination
          basePath={listBasePath}
          currentPage={data.pagination.page}
          total={data.pagination.total}
          pageSize={data.pagination.limit}
          listQuery={
            selectedTagSlugs.length ? { tagSlugs: selectedTagSlugs, tagMatch } : undefined
          }
        />
      </div>

      <SiteFooter />
    </div>
  )
}
