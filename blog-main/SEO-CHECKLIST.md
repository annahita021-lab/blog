# SEO checklist — Blog PCA (Search Console & technical SEO)

**Goal:** Ship a site Google can crawl, index, and understand with minimal errors in [Google Search Console](https://search.google.com/search-console).

**Note on “100%”:** Search Console does not give a single 0–100 score. What teams usually mean is: **no critical issues**, **good coverage** (valid indexed URLs), **healthy Core Web Vitals**, and **accurate rich results** where applicable. Use this list as your execution backlog.

**Implementation status (code):** Phase B–D and most of F–G from the “Suggested order” section are implemented in the repo. Phases A and verification remain **manual** (GSC UI, DNS, hosting).

---

## Phase A — Search Console & domain setup _(manual)_

- [ ] **Create / confirm Search Console property** (Domain property preferred for all subdomains/protocols, or URL-prefix for a single origin).
- [ ] **Verify ownership** — Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for the meta-tag method, or use DNS/HTML file.
- [ ] **Submit XML sitemap URL** after deploy (e.g. `https://yourdomain.com/sitemap.xml`).
- [ ] **HTTPS & single host** — Redirect `www` ↔ apex consistently; match `NEXT_PUBLIC_SITE_URL` to the canonical origin (no trailing slash in env).
- [ ] **Google Analytics 4** (optional) linked for traffic vs indexation context.

---

## Phase B — Crawling & indexation

- [x] **`robots.txt`** — `app/robots.ts` (allow `/`, `Sitemap` URL from `NEXT_PUBLIC_SITE_URL`).
- [x] **Dynamic `sitemap.xml`** — `app/sitemap.ts` (home, categories, articles). _Wire API/CMS URLs when content is dynamic._
- [x] **Canonical URLs** — `/` (home), `/article/[slug]`, `/category/[id]` via `metadata.alternates.canonical`.
- [ ] **No accidental `noindex`** — Re-audit when adding drafts/previews.
- [ ] **HTTP status hygiene** — Hosting/CDN responsibility (`404`/`410`/`301`).
- [ ] **Pagination / filters** — Category role filters are client-only (no query URLs); strategy OK until APIs add filters.

---

## Phase C — Metadata & social

- [x] **Unique titles** — Root template `%s | {SITE_NAME}`; home default; category `"{title} — Articles"`; article uses article title.
- [x] **Unique descriptions** — Root default; category & article use their descriptions/excerpts.
- [x] **Open Graph** — Layout defaults + per-route `openGraph` (article type `article`). Home includes hero image.
- [x] **Twitter cards** — `summary_large_image` on layout + article (category: text-only card unless you add images later).
- [x] **`lang` on `<html>`** — `lang="en"` in root layout.

---

## Phase D — Structured data (JSON-LD)

Validate with [Rich Results Test](https://search.google.com/test/rich-results).

- [x] **Organization** — `OrganizationJsonLd` in root layout (`/images/logo.png` as logo URL).
- [x] **BreadcrumbList** — Article (Home → Category → Article) and category (Home → Category).
- [x] **Article** — `ArticleJsonLd` on article pages (`publisher` references `${siteUrl}/#organization`).
- [x] **WebPage** — Category pages for the hub URL.
- [ ] **FAQ / HowTo** — Only if content matches guidelines.

---

## Phase E — HTML semantics & content signals

- [x] **`<h1>`** — Home, category, article each expose one primary heading.
- [x] **Heading order** — Article body uses `h2`/`h3` from markdown pipeline.
- [x] **Landmarks** — Existing header/main/footer/article/nav patterns preserved.
- [x] **Internal links** — `next/link` for primary navigation and listings.
- [x] **Image `alt`** — Informative images use titles; hero uses decorative empty `alt` + OG `alt` on metadata image object.

---

## Phase F — Performance & UX

- [ ] **Core Web Vitals** — Measure on production URLs (PSI / CrUX).
- [x] **Hero `next/image`** — Home hero uses `priority` + `sizes="100vw"`.
- [x] **Image optimization** — Removed `unoptimized: true`; added `images.remotePatterns` for `images.unsplash.com`.
- [x] **Fonts** — Geist applied on `<body>` via `next/font`.
- [ ] **Third-party scripts** — Keep auditing as you add tags.

---

## Phase G — App Router architecture

- [x] **Server Components default** — Article route uses `ArticlePageClient` for TOC; category browse uses server `CategoryApiPage`; home grid is server-rendered.
- [x] **`generateMetadata`** — Article and category routes.
- [x] **`generateStaticParams`** — All article and category slugs from `lib/blog-data`.
- [ ] **Streaming / Suspense** — Add when API-bound sections exist.

---

## Phase H — When APIs / CMS are connected _(later)_

- [ ] Stable URLs / redirects for slug changes.
- [ ] `dateModified` from CMS + sitemap `lastModified`.
- [ ] Preview URLs: `noindex` + auth.
- [ ] CI/build hook to refresh sitemap entries.

---

## Verification rhythm _(manual, post-deploy)_

- [ ] URL Inspection for sample URLs.
- [ ] Coverage / Pages report.
- [ ] Sitemaps report success.
- [ ] Enhancements (breadcrumbs, articles if eligible).
- [ ] Core Web Vitals report.

---

## Suggested order of implementation (this repo)

1. [x] `robots.ts` + `sitemap.ts` + canonical + OG on layout.
2. [x] Refactor article/category to Server Components + `generateMetadata`.
3. [x] JSON-LD: Organization, BreadcrumbList, Article (+ WebPage on categories).
4. [x] Image strategy (hero `next/image`, remote patterns, drop global `unoptimized`).
5. [ ] Search Console: verify, submit sitemap, monitor.

---

## Env vars (`/.env` or `.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (no trailing slash), e.g. `https://blog.example.com` |
| `NEXT_PUBLIC_SITE_NAME` | Brand string for titles & Organization schema |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | GSC meta verification token (optional) |

---

*Last updated: aligned with initial SEO implementation pass — extend when APIs ship.*
