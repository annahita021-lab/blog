'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import type { Article } from '@/lib/blog-data'
import type { TableOfContentsItem } from '@/lib/article-markdown'
import { categoryBrowseHref } from '@/lib/blog-env'
import { DocShellHeader } from '@/components/doc-shell-header'
import { SiteFooter } from '@/components/site-footer'

export function ArticlePageClient({
  article,
  relatedArticles,
  relatedSectionTitle,
  headings,
  htmlContent,
}: {
  article: Article
  relatedArticles: Article[]
  relatedSectionTitle: string
  headings: TableOfContentsItem[]
  htmlContent: string
}) {
  const t = useTranslations('Article')
  const locale = useLocale()
  const [activeHeading, setActiveHeading] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id))
      const scrollPosition = window.scrollY + 100

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveHeading(headings[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  const showAside = headings.length > 0 || relatedArticles.length > 0
  const dateLabel = new Date(article.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DocShellHeader />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={categoryBrowseHref(article.categorySlug)}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToCategory', { category: article.category })}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
        <div className={`flex flex-col gap-10 ${showAside ? 'lg:flex-row' : ''}`}>
          <article className={`flex-1 min-w-0 ${showAside ? 'max-w-3xl' : ''}`}>
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                </span>
              </div>
            </header>

            <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </article>

          {showAside ? (
            <aside className="lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-8 space-y-8">
                {headings.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                      {t('onThisPage')}
                    </h3>
                    <nav className="space-y-1">
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`block text-sm py-1.5 transition-colors ${
                            heading.level === 3 ? 'pl-4' : ''
                          } ${
                            activeHeading === heading.id
                              ? 'text-accent font-medium'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            const element = document.getElementById(heading.id)
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' })
                            }
                          }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {relatedArticles.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                      {relatedSectionTitle}
                    </h3>
                    <div className="space-y-4">
                      {relatedArticles.map((related) => (
                        <Link key={related.id} href={`/article/${related.slug}`} className="group block">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={related.image}
                                alt={related.title}
                                fill
                                unoptimized
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                                {related.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
