import { Rocket } from 'lucide-react'
import type { BlogCategory } from '@/lib/blog-api'
import { resolveBlogCategoryIconUrl } from '@/lib/blog-api'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

function articleTotal(category: BlogCategory): number {
  if (typeof category.totalPostCount === 'number') return category.totalPostCount
  if (typeof category.postCount === 'number') return category.postCount
  return 0
}

export async function BlogApiCategoryGrid({ categories }: { categories: BlogCategory[] }) {
  const t = await getTranslations('BlogGrid')

  if (categories.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        {t.rich('empty', {
          code: (chunks) => (
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{chunks}</code>
          ),
        })}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories
        .filter((c) => {
          const n = Number(c.id)
          return Number.isFinite(n) && n > 0
        })
        .map((category) => {
          const cid = Number(category.id)
          const iconSrc = resolveBlogCategoryIconUrl(category.icon)
          const total = articleTotal(category)

          return (
            <Link key={cid} href={`/category/${cid}`} prefetch className="group">
              <article className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 shadow-sm hover:border-accent/50 hover:bg-secondary/30 transition-all duration-200">
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-secondary border border-border overflow-hidden">
                  {iconSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- icon host from NEXT_PUBLIC_API_URL_PHOTO
                    <img src={iconSrc} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <Rocket
                      className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                    {category.typeName}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t('articleLine', { count: total })}
                  </p>
                </div>
              </article>
            </Link>
          )
        })}
    </div>
  )
}
