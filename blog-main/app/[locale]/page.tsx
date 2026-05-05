import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { BlogApiCategoryGrid } from '@/components/blog-api-category-grid'
import { getBlogListCategories } from '@/lib/blog-api'
import { getBlogLanguage, getBlogRootCategoryId } from '@/lib/blog-env'
import { localePath } from '@/lib/locale-path'
import { getSiteDefaultDescription, getSiteDefaultTitle, getSiteName } from '@/lib/site'
import { SiteFooter } from '@/components/site-footer'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteName = getSiteName()
  const siteDefaultTitle = getSiteDefaultTitle()
  const siteDefaultDescription = getSiteDefaultDescription()
  const t = await getTranslations({ locale, namespace: 'Home' })
  const canonical = localePath(locale, '/')

  return {
    title: siteDefaultTitle,
    description: siteDefaultDescription,
    alternates: { canonical },
    openGraph: {
      title: siteDefaultTitle,
      description: siteDefaultDescription,
      url: canonical,
      images: [
        {
          url: HERO_IMAGE,
          width: 1920,
          height: 1080,
          alt: t('heroImageAlt'),
        },
      ],
    },
    twitter: {
      title: siteDefaultTitle,
      description: siteDefaultDescription,
      images: [HERO_IMAGE],
    },
  }
}

export default async function BlogHomepage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const rootId = getBlogRootCategoryId()
  const lang = getBlogLanguage()
  const categories =
    rootId > 0 ? await getBlogListCategories(rootId, lang) : []

  const siteName = getSiteName()
  const t = await getTranslations('Home')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="h-[72px]" />

      <section className="relative border-b border-border overflow-hidden min-h-[280px] md:min-h-[360px]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/75 to-foreground/85" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-balance">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 text-lg text-white/70 text-pretty">
              {t('heroSubtitle')}
            </p>

            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                className="w-full h-14 pl-12 pr-4 text-base bg-background border-border rounded-xl shadow-sm focus:ring-2 focus:ring-accent focus:border-accent"
                aria-label={t('searchAria', { siteName })}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold text-foreground mb-8">{t('browseHeading')}</h2>

            <BlogApiCategoryGrid categories={categories} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
