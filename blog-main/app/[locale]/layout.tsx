import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { OrganizationJsonLd } from '@/components/seo/json-ld'
import { routing } from '@/i18n/routing'
import { getSiteDefaultDescription, getSiteDefaultTitle, getSiteName, getSiteUrl } from '@/lib/site'

const geistSans = Geist({ subsets: ['latin'] })

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()

function ogLocaleFor(locale: string): string {
  return locale === 'fr' ? 'fr_FR' : 'en_US'
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = getSiteUrl()
  const siteName = getSiteName()
  const siteDefaultTitle = getSiteDefaultTitle()
  const siteDefaultDescription = getSiteDefaultDescription()

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteDefaultTitle,
      template: `%s | ${siteName}`,
    },
    description: siteDefaultDescription,
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    openGraph: {
      type: 'website',
      locale: ogLocaleFor(locale),
      url: `/${locale}`,
      siteName,
      title: siteDefaultTitle,
      description: siteDefaultDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteDefaultTitle,
      description: siteDefaultDescription,
    },
    icons: {
      icon: [
        {
          url: '/icon-light-32x32.png',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/icon-dark-32x32.png',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: '/icon.svg',
          type: 'image/svg+xml',
        },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()

  const siteUrl = getSiteUrl()
  const siteName = getSiteName()

  return (
    <html lang={locale} className="bg-background">
      <body className={`${geistSans.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <OrganizationJsonLd siteUrl={siteUrl} siteName={siteName} logoPath="/images/logo.png" />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
