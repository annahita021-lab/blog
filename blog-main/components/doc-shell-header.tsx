'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { getSiteName } from '@/lib/site'

export function DocShellHeader() {
  const t = useTranslations('DocHeader')
  const brand = getSiteName()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-foreground">
          {brand}
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('home')}
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('documentation')}
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('api')}
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('support')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
