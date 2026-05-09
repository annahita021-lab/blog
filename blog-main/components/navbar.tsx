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

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [productsMenuOpen, setProductsMenuOpen] = useState(false)

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

  const productItems = [
    { label: t("maintenance"), href: "#maintenance" },
    { label: t("assetsParts"), href: "#assets-parts" },
    { label: t("communication"), href: "#communication" },
    { label: t("crm"), href: "#crm" },
    { label: t("salesRentals"), href: "#sales-rentals" },
  ]

  const navLinks = [
    { label: t("pricing"), href: "#pricing" },
    { label: t("blog"), href: "/" },
    { label: t("ourCompany"), href: "#company" },
  ]

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
              width={850}
              height={640}
              className="h-15 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Products Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                onBlur={() => setTimeout(() => setProductsMenuOpen(false), 150)}
                className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-[var(--header-accent)] hover:bg-[var(--header-accent)]/5 group"
                aria-expanded={productsMenuOpen}
                aria-haspopup="menu"
              >
                {t("products")}
                <span className="text-xs font-bold">+</span>
                <span className="absolute bottom-1 left-4 right-4 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
              </button>
              {productsMenuOpen && (
                <div className="absolute left-0 top-full mt-1 min-w-[200px] rounded-lg border border-gray-100 bg-white py-2 shadow-lg z-50">
                  {productItems.map((item, index) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setProductsMenuOpen(false)}
                      className={cn(
                        "relative block px-5 py-3 text-sm font-medium text-gray-700 hover:text-[var(--header-accent)] hover:bg-gray-50 transition-colors group",
                        index !== productItems.length - 1 && "border-b border-gray-100"
                      )}
                    >
                      {item.label}
                      <span className="absolute bottom-2 left-5 right-5 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-[var(--header-accent)] hover:bg-[var(--header-accent)]/5 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-[var(--header-accent)] hover:bg-[var(--header-accent)]/5"
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
              >
                {locale === "fr" ? (
                  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
                    <path fill="#002654" d="M0 0h213.3v480H0z" />
                    <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
                    <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
                    <path fill="#012169" d="M0 0h640v480H0z" />
                    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
                    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
                    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
                    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
                  </svg>
                )}
                <span className="text-xs font-bold">+</span>
              </button>
              {langMenuOpen && (
                <ul
                  className="absolute left-1/2 -translate-x-[20%] top-full mt-1 min-w-[160px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg z-50"
                  role="listbox"
                >
                  {routing.locales.map((loc) => (
                    <li key={loc}>
                      <button
                        type="button"
                        role="option"
                        className="relative flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 hover:text-[var(--header-accent)] group"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => switchLocale(loc)}
                      >
                        {loc === "en" ? (
                          <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
                            <path fill="#012169" d="M0 0h640v480H0z" />
                            <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
                            <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
                            <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
                            <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
                            <path fill="#002654" d="M0 0h213.3v480H0z" />
                            <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
                            <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
                          </svg>
                        )}
                        {loc === "en" ? t("english") : t("french")}
                        <span className="absolute bottom-1 left-4 right-4 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
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
              className="bg-[var(--header-accent)] hover:bg-[var(--header-accent-hover)] text-white font-medium px-5 h-10 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
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
          {/* Mobile Products Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setProductsMenuOpen(!productsMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-[var(--header-accent)] hover:bg-[var(--header-accent)]/5 transition-colors"
            >
              <span>{t("products")}</span>
              <span className={cn("text-xs font-bold transition-transform", productsMenuOpen && "rotate-45")}>+</span>
            </button>
            {productsMenuOpen && (
              <div className="ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
                {productItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setProductsMenuOpen(false)
                      setIsMobileMenuOpen(false)
                    }}
                    className="relative block px-4 py-2 text-sm text-gray-600 hover:text-[var(--header-accent)] transition-colors group"
                  >
                    {item.label}
                    <span className="absolute bottom-1 left-4 right-4 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative block px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-[var(--header-accent)] hover:bg-[var(--header-accent)]/5 transition-colors group"
            >
              {link.label}
              <span className="absolute bottom-2 left-4 right-4 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
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
                className="relative flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-[var(--header-accent)] hover:bg-[var(--header-accent)]/5 transition-colors text-left group"
              >
                {loc === "en" ? (
                  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
                    <path fill="#012169" d="M0 0h640v480H0z" />
                    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
                    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
                    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
                    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
                    <path fill="#002654" d="M0 0h213.3v480H0z" />
                    <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
                    <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
                  </svg>
                )}
                {loc === "en" ? t("english") : t("french")}
                <span className="absolute bottom-2 left-4 right-4 h-px bg-[var(--header-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
              </button>
            ))}
          </div>

          <div className="pt-3 px-4">
            <Button
              asChild
              className="w-full bg-[var(--header-accent)] hover:bg-[var(--header-accent-hover)] text-white font-medium h-11 rounded-lg"
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
