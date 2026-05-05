'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Calendar } from 'lucide-react'
import type { BlogCategory, CategoryFacetTag } from '@/lib/blog-api'
import type { CategoryPostCard } from '@/lib/category-post-utils'
import { slugSegmentForTag, slugifyTagLabel, tagBrowsePath } from '@/lib/tag-url'
import { buildCategoryListHref } from '@/lib/blog-list-paging'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type RoleTagOption = { slug: string; name: string }

function humanizeSlugSegment(slug: string): string {
  const s = slug.replace(/-/g, ' ').trim()
  if (!s) return slug
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function facetTagsToRoleOptions(facets: CategoryFacetTag[], extraSelectedSlugs: string[]): RoleTagOption[] {
  const map = new Map<string, string>()
  for (const t of facets) {
    const seg = (t.slug?.trim() || slugifyTagLabel(t.name)).trim() || String(t.id)
    const label = t.articleCount > 0 ? `${t.name} (${t.articleCount})` : t.name
    map.set(seg, label)
  }
  for (const s of extraSelectedSlugs) {
    const trimmed = s.trim()
    if (!trimmed) continue
    if (![...map.keys()].some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      map.set(trimmed, humanizeSlugSegment(trimmed))
    }
  }
  return [...map.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

function roleTagOptionsFromPosts(
  posts: CategoryPostCard[],
  extraSelectedSlugs: string[],
  excludeSlugNormalized?: string,
): RoleTagOption[] {
  const map = new Map<string, string>()
  const ex = excludeSlugNormalized?.trim().toLowerCase()

  for (const p of posts) {
    for (const t of p.tags) {
      const seg = slugSegmentForTag(t)
      if (ex && seg.toLowerCase() === ex) continue
      if (!map.has(seg)) map.set(seg, t.name)
    }
  }

  for (const slug of extraSelectedSlugs) {
    const trimmed = slug.trim()
    if (!trimmed) continue
    if (!map.has(trimmed)) map.set(trimmed, humanizeSlugSegment(trimmed))
  }

  return [...map.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

function toggleSlugList(slugs: string[], slug: string): string[] {
  const lo = slug.toLowerCase()
  const has = slugs.some((s) => s.toLowerCase() === lo)
  if (has) return slugs.filter((s) => s.toLowerCase() !== lo)
  return [...slugs, slug]
}

function postMatchesAnySelectedTagSlug(post: CategoryPostCard, selectedSlugs: string[]): boolean {
  if (selectedSlugs.length === 0) return true
  const want = new Set(selectedSlugs.map((s) => s.toLowerCase()))
  return post.tags.some((t) => want.has(slugSegmentForTag(t).toLowerCase()))
}

export function CategoryBrowseClient({
  siblingCategories,
  currentCategoryId,
  posts,
  filterScopeKey,
  highlightTagSlug,
  emptyListMessage,
  tagFilterMode = 'client',
  listBasePath,
  selectedTagSlugs = [],
  tagMatch = 'any',
  facetTags,
}: {
  siblingCategories: BlogCategory[]
  currentCategoryId: number
  posts: CategoryPostCard[]
  /** Prefix for stable Role filter checkbox ids (e.g. tag page vs category page). */
  filterScopeKey?: string
  /** When set, that tag chip is visually emphasized (tag listing page). */
  highlightTagSlug?: string
  emptyListMessage?: string
  /** `server`: URL `tagSlugs` + API filter. `client`: narrow the loaded list (e.g. tag page). */
  tagFilterMode?: 'server' | 'client'
  listBasePath?: string
  selectedTagSlugs?: string[]
  tagMatch?: 'all' | 'any'
  /** From API flat category: all tags in the category tree (preferred over inferring from `posts`). */
  facetTags?: CategoryFacetTag[]
}) {
  const t = useTranslations('Browse')
  const locale = useLocale()
  const router = useRouter()
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US'
  const scope = filterScopeKey ?? `cat-${currentCategoryId}`
  const [selectedSlugsClient, setSelectedSlugsClient] = useState<string[]>([])

  const excludeForFacets = highlightTagSlug?.trim() ?? ''

  const roleOptions = useMemo(() => {
    if (tagFilterMode === 'server') {
      if (facetTags && facetTags.length > 0) {
        return facetTagsToRoleOptions(facetTags, selectedTagSlugs)
      }
      return roleTagOptionsFromPosts(posts, selectedTagSlugs, undefined)
    }
    return roleTagOptionsFromPosts(posts, [], excludeForFacets || undefined)
  }, [tagFilterMode, posts, selectedTagSlugs, excludeForFacets, facetTags])

  const apiPostsHaveNoTags = useMemo(
    () => posts.length > 0 && posts.every((p) => p.tags.length === 0),
    [posts],
  )

  const selectedClientSet = useMemo(() => new Set(selectedSlugsClient.map((s) => s.toLowerCase())), [selectedSlugsClient])

  const filtered = useMemo(() => {
    if (tagFilterMode === 'server') return posts
    return posts.filter((post) => {
      if (selectedSlugsClient.length === 0) return true
      if (apiPostsHaveNoTags) return true
      return postMatchesAnySelectedTagSlug(post, selectedSlugsClient)
    })
  }, [posts, tagFilterMode, selectedSlugsClient, apiPostsHaveNoTags])

  const toggleRoleClient = (slug: string) => {
    setSelectedSlugsClient((prev) => toggleSlugList(prev, slug))
  }

  const pushServerTagFilter = (nextSlugs: string[]) => {
    if (!listBasePath) return
    router.push(
      buildCategoryListHref(listBasePath, {
        page: 1,
        tagSlugs: nextSlugs.length ? nextSlugs : undefined,
        tagMatch,
      }),
    )
  }

  const toggleRoleServer = (slug: string) => {
    const next = toggleSlugList(selectedTagSlugs, slug)
    pushServerTagFilter(next)
  }

  const emptyCopy = emptyListMessage ?? t('emptyCategory')

  const showRoleSection = tagFilterMode === 'server' || roleOptions.length > 0 || selectedSlugsClient.length > 0

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 shrink-0">
        <div className="lg:sticky lg:top-8 space-y-8">
          {siblingCategories.length > 0 ? (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">{t('categories')}</h3>
              <nav className="space-y-1">
                {siblingCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      cat.id === currentCategoryId
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.typeName}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}

          {showRoleSection ? (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{t('role')}</h3>
                {tagFilterMode === 'server' && selectedTagSlugs.length > 0 && listBasePath ? (
                  <Link
                    href={listBasePath}
                    className="text-xs text-muted-foreground hover:text-foreground underline shrink-0"
                  >
                    {t('clear')}
                  </Link>
                ) : null}
              </div>
              {roleOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {tagFilterMode === 'server' ? t('noTagsCategory') : t('noTagsPage')}
                </p>
              ) : (
                <div className="space-y-3">
                  {roleOptions.map((opt, idx) => {
                    const fieldId = `role-filter-${scope}-${idx}-${encodeURIComponent(opt.slug).slice(0, 48)}`
                    if (tagFilterMode === 'server') {
                      const checked = selectedTagSlugs.some((s) => s.toLowerCase() === opt.slug.toLowerCase())
                      return (
                        <div key={`${opt.slug}-${idx}`} className="flex items-center gap-3">
                          <Checkbox
                            id={fieldId}
                            checked={checked}
                            onCheckedChange={() => toggleRoleServer(opt.slug)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label htmlFor={fieldId} className="text-sm text-foreground cursor-pointer">
                            {opt.name}
                          </Label>
                        </div>
                      )
                    }
                    const checked = selectedClientSet.has(opt.slug.toLowerCase())
                    return (
                      <div key={`${opt.slug}-${idx}`} className="flex items-center gap-3">
                        <Checkbox
                          id={fieldId}
                          checked={checked}
                          onCheckedChange={() => toggleRoleClient(opt.slug)}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={fieldId} className="text-sm text-foreground cursor-pointer">
                          {opt.name}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {posts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">{emptyCopy}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">{t('noMatchFilters')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <article
                key={post.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover:border-muted-foreground/30"
              >
                <div className="flex flex-col sm:flex-row">
                  <Link
                    href={`/article/${post.slug}`}
                    className="relative w-full sm:w-48 h-36 sm:min-h-[140px] shrink-0 bg-muted block group/img"
                  >
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover group-hover/img:opacity-95 transition-opacity"
                        sizes="(max-width: 640px) 100vw, 192px"
                      />
                    ) : null}
                  </Link>
                  <div className="p-5 flex flex-col justify-center min-w-0 flex-1">
                    <Link href={`/article/${post.slug}`} className="group block min-w-0">
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      ) : null}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {post.publishDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.publishDate).toLocaleDateString(dateLocale, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      ) : null}
                      {post.tags.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {post.tags.map((tag, tidx) => {
                            const active =
                              highlightTagSlug &&
                              slugSegmentForTag(tag).toLowerCase() === highlightTagSlug.trim().toLowerCase()
                            return (
                              <Link
                                key={tag.id ?? `${tag.slug ?? tag.name}-${tidx}`}
                                href={tagBrowsePath(tag)}
                                className={`px-2 py-0.5 rounded-full transition-colors ${
                                  active
                                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-card'
                                    : 'bg-muted text-foreground/90 hover:bg-muted/80 hover:text-foreground'
                                }`}
                              >
                                {tag.name}
                              </Link>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
