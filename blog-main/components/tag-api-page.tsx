import { ArrowLeft, Tag } from 'lucide-react'
import type { TagPostsFlatResponse } from '@/lib/blog-api'
import type { CategoryPostCard } from '@/lib/category-post-utils'
import { CategoryBrowseClient } from '@/components/category-browse-client'
import { BlogPagination } from '@/components/blog-pagination'
import { DocShellHeader } from '@/components/doc-shell-header'
import { SiteFooter } from '@/components/site-footer'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export async function TagApiPage({
  data,
  normalizedPosts,
  routeTagSlug,
  listBasePath,
}: {
  data: TagPostsFlatResponse
  normalizedPosts: CategoryPostCard[]
  routeTagSlug: string
  listBasePath: string
}) {
  const t = await getTranslations('Tag')

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
            <Tag className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.tagName}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('descriptionTagged', {
                name: data.tagName,
                count: data.pagination.total,
                tag: data.tagName,
              })}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        <CategoryBrowseClient
          siblingCategories={[]}
          currentCategoryId={0}
          posts={normalizedPosts}
          filterScopeKey={`tag-${routeTagSlug}`}
          highlightTagSlug={routeTagSlug}
          emptyListMessage={t('noArticlesTag')}
        />
        <BlogPagination
          basePath={listBasePath}
          currentPage={data.pagination.page}
          total={data.pagination.total}
          pageSize={data.pagination.limit}
        />
      </div>

      <SiteFooter />
    </div>
  )
}
