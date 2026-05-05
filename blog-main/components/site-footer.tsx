'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function SiteFooter() {
  const t = useTranslations('Footer')

  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t('rights')}</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('privacy')}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('terms')}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
