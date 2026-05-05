'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Category } from '@/lib/blog-data'
import { articles, categories, roles } from '@/lib/blog-data'
import { DocShellHeader } from '@/components/doc-shell-header'
import { SiteFooter } from '@/components/site-footer'

export function CategoryStaticPage({
  category,
  slug,
}: {
  category: Category
  slug: string
}) {
  const t = useTranslations('Browse')
  const locale = useLocale()
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = article.categorySlug === slug
    const matchesRole =
      selectedRoles.length === 0 || selectedRoles.some((role) => article.roles.includes(role))
    return matchesCategory && matchesRole
  })

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DocShellHeader />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToCategories')}
          </Link>
        </div>
      </div>

      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-3xl font-bold text-foreground">{category.title}</h1>
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-8 space-y-8">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                  {t('categories')}
                </h3>
                <nav className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        cat.slug === slug
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {cat.title}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">{t('role')}</h3>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center gap-3">
                      <Checkbox
                        id={`static-role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={`static-role-${role}`} className="text-sm text-foreground cursor-pointer">
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">{t('noMatchFilters')}</p>
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <Link key={article.id} href={`/article/${article.slug}`} className="group block">
                    <article className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover:border-muted-foreground/30">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-48 h-36 sm:min-h-[140px] shrink-0">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 192px"
                          />
                        </div>
                        <div className="p-5 flex flex-col justify-center">
                          <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                            {article.title}
                          </h2>
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(article.date).toLocaleDateString(dateLocale, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="px-2 py-0.5 bg-muted rounded-full">{article.category}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
