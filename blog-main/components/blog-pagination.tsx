import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildCategoryListHref } from '@/lib/blog-list-paging'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

const linkClass =
  'inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors'
const disabledClass =
  'inline-flex items-center gap-1 rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground cursor-not-allowed'

function hrefForPage(
  basePath: string,
  page: number,
  listQuery?: { tagSlugs?: string[]; tagMatch?: 'all' | 'any' },
): string {
  return buildCategoryListHref(basePath, {
    page: page > 1 ? page : undefined,
    tagSlugs: listQuery?.tagSlugs?.length ? listQuery.tagSlugs : undefined,
    tagMatch: listQuery?.tagMatch,
  })
}

export async function BlogPagination({
  basePath,
  currentPage,
  total,
  pageSize,
  listQuery,
}: {
  basePath: string
  currentPage: number
  total: number
  pageSize: number
  listQuery?: { tagSlugs?: string[]; tagMatch?: 'all' | 'any' }
}) {
  const t = await getTranslations('Pagination')
  const totalPages = total <= 0 ? 1 : Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  return (
    <nav className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" aria-label={t('navLabel')}>
      <div className="flex items-center gap-2">
        {safePage > 1 ? (
          <Link href={hrefForPage(basePath, safePage - 1, listQuery)} className={linkClass}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t('previous')}
          </Link>
        ) : (
          <span className={disabledClass}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t('previous')}
          </span>
        )}
        {safePage < totalPages ? (
          <Link href={hrefForPage(basePath, safePage + 1, listQuery)} className={linkClass}>
            {t('next')}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={disabledClass}>
            {t('next')}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {t('pageOf', { current: safePage, total: totalPages })}
        <span className="mx-1.5">·</span>
        {t('articleCount', { count: total })}
      </p>
    </nav>
  )
}
