"use client"

import { useState, useEffect, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { routing } from "@/i18n/routing"

export function Navbar() {
  const t = useTranslations("Nav")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const navLinks = [
    { label: t("products"), href: "#products" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("blog"), href: "/" },
    { label: t("ourCompany"), href: "#company" },
  ]

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const switchLocale = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
    setLangMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white"
      )}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Property Care App"
              width={120}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-[#722F37] hover:bg-[#722F37]/5 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#722F37] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-[#722F37] hover:bg-[#722F37]/5"
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
              >
                <span className="text-base">{locale === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", langMenuOpen && "rotate-180")} />
              </button>
              {langMenuOpen && (
                <ul
                  className="absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg z-50"
                  role="listbox"
                >
                  {routing.locales.map((loc) => (
                    <li key={loc}>
                      <button
                        type="button"
                        role="option"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 hover:text-[#722F37]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => switchLocale(loc)}
                      >
                        {loc === "en" ? t("english") : t("french")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              className="bg-[#722F37] hover:bg-[#5a252c] text-white font-medium px-5 h-10 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Link href="#quote">{t("requestQuote")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t("toggleMenu")}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-96 border-t border-gray-100" : "max-h-0"
        )}
      >
        <div className="bg-white px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-[#722F37] hover:bg-[#722F37]/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Language Switcher */}
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <p className="px-4 text-xs text-gray-500 uppercase tracking-wide">{t("language")}</p>
            {routing.locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => switchLocale(loc)}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-[#722F37] hover:bg-[#722F37]/5 transition-colors text-left"
              >
                {loc === "en" ? t("english") : t("french")}
              </button>
            ))}
          </div>

          <div className="pt-3 px-4">
            <Button
              asChild
              className="w-full bg-[#722F37] hover:bg-[#5a252c] text-white font-medium h-11 rounded-lg"
            >
              <Link href="#quote" onClick={() => setIsMobileMenuOpen(false)}>
                {t("requestQuote")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
