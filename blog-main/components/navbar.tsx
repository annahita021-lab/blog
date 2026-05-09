"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { Menu, X, ChevronDown, Wrench, Package, MessageCircle, Users, Building2 } from "lucide-react"
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false)
  
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
  }

  const handleMouseEnter = (dropdown: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const productItems = [
    { label: t("maintenance"), href: "#maintenance", icon: Wrench, description: "Track and manage maintenance requests" },
    { label: t("assetsParts"), href: "#assets-parts", icon: Package, description: "Inventory and asset management" },
    { label: t("communication"), href: "#communication", icon: MessageCircle, description: "Resident communication tools" },
    { label: t("crm"), href: "#crm", icon: Users, description: "Customer relationship management" },
    { label: t("salesRentals"), href: "#sales-rentals", icon: Building2, description: "Property sales and rental listings" },
  ]

  const companyItems = [
    { label: t("aboutUs"), href: "#about", description: "Learn about our mission" },
    { label: t("contact"), href: "#contact", description: "Get in touch with us" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/98 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gray-100/50"
          : "bg-white"
      )}
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Property Care App"
              width={140}
              height={56}
              className="h-11 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Products Mega Menu */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('products')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200",
                  activeDropdown === 'products'
                    ? "text-[var(--header-accent)]"
                    : "text-gray-700 hover:text-[var(--header-accent)]"
                )}
              >
                {t("products")}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  activeDropdown === 'products' && "rotate-180"
                )} />
              </button>
              
              {/* Products Dropdown */}
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200",
                activeDropdown === 'products'
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              )}>
                <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100/80 p-2 min-w-[320px]">
                  {productItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-150 group",
                          "hover:bg-[var(--header-accent)]/5"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-[var(--header-accent)]/10 text-[var(--header-accent)] group-hover:bg-[var(--header-accent)] group-hover:text-white transition-colors duration-150">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-semibold text-gray-900 group-hover:text-[var(--header-accent)] transition-colors">
                            {item.label}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <Link
              href="#pricing"
              className="px-4 py-2.5 text-[15px] font-medium text-gray-700 rounded-lg transition-all duration-200 hover:text-[var(--header-accent)]"
            >
              {t("pricing")}
            </Link>

            {/* Blog */}
            <Link
              href="/"
              className="px-4 py-2.5 text-[15px] font-medium text-gray-700 rounded-lg transition-all duration-200 hover:text-[var(--header-accent)]"
            >
              {t("blog")}
            </Link>

            {/* Our Company Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200",
                  activeDropdown === 'company'
                    ? "text-[var(--header-accent)]"
                    : "text-gray-700 hover:text-[var(--header-accent)]"
                )}
              >
                {t("ourCompany")}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  activeDropdown === 'company' && "rotate-180"
                )} />
              </button>
              
              {/* Company Dropdown */}
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200",
                activeDropdown === 'company'
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              )}>
                <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100/80 p-2 min-w-[220px]">
                  {companyItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-3 rounded-xl transition-all duration-150 hover:bg-[var(--header-accent)]/5 group"
                    >
                      <span className="block text-sm font-semibold text-gray-900 group-hover:text-[var(--header-accent)] transition-colors">
                        {item.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <div 
              className="relative ml-2"
              onMouseEnter={() => handleMouseEnter('lang')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2.5 text-[15px] font-medium text-gray-700 rounded-lg transition-all duration-200 hover:text-[var(--header-accent)]"
              >
                {locale === "fr" ? (
                  <svg className="w-5 h-4 rounded-[3px] overflow-hidden shadow-sm" viewBox="0 0 640 480">
                    <path fill="#002654" d="M0 0h213.3v480H0z"/>
                    <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
                    <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-4 rounded-[3px] overflow-hidden shadow-sm" viewBox="0 0 640 480">
                    <path fill="#012169" d="M0 0h640v480H0z"/>
                    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
                    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
                    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
                    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
                  </svg>
                )}
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  activeDropdown === 'lang' && "rotate-180"
                )} />
              </button>
              
              {/* Language Dropdown */}
              <div className={cn(
                "absolute right-0 top-full pt-3 transition-all duration-200",
                activeDropdown === 'lang'
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              )}>
                <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100/80 p-1.5 min-w-[150px]">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => switchLocale(loc)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150",
                        locale === loc
                          ? "bg-[var(--header-accent)]/10 text-[var(--header-accent)] font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {loc === "en" ? (
                        <svg className="w-5 h-4 rounded-[3px] overflow-hidden shadow-sm" viewBox="0 0 640 480">
                          <path fill="#012169" d="M0 0h640v480H0z"/>
                          <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
                          <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
                          <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
                          <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-4 rounded-[3px] overflow-hidden shadow-sm" viewBox="0 0 640 480">
                          <path fill="#002654" d="M0 0h213.3v480H0z"/>
                          <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
                          <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
                        </svg>
                      )}
                      {loc === "en" ? t("english") : t("french")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right Side - CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Chat Icon - Desktop */}
            <button
              type="button"
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-[var(--header-accent)] text-white transition-all duration-200 hover:bg-[var(--header-accent-hover)] hover:scale-105"
              aria-label={t("chat")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* CTA Button */}
            <Button
              asChild
              className="hidden lg:inline-flex bg-[var(--header-accent)] hover:bg-[var(--header-accent-hover)] text-white font-semibold px-6 h-11 rounded-full shadow-lg shadow-[var(--header-accent)]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--header-accent)]/30 hover:scale-[1.02]"
            >
              <Link href="#quote">{t("requestQuote")}</Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                isMobileMenuOpen
                  ? "bg-[var(--header-accent)] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
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
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-[72px] bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-lg transition-all duration-300 ease-out overflow-hidden",
          isMobileMenuOpen ? "max-h-[calc(100vh-72px)] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-6 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Mobile Products Accordion */}
          <div className="border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
              className="flex items-center justify-between w-full px-4 py-3.5 text-[15px] font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span>{t("products")}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-gray-400 transition-transform duration-200",
                mobileProductsOpen && "rotate-180"
              )} />
            </button>
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              mobileProductsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="pl-4 pr-2 py-2 space-y-1">
                {productItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[var(--header-accent)]/5 hover:text-[var(--header-accent)] transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <Link
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-3.5 text-[15px] font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t("pricing")}
          </Link>

          {/* Blog */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-3.5 text-[15px] font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t("blog")}
          </Link>

          {/* Mobile Company Accordion */}
          <div className="border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => setMobileCompanyOpen(!mobileCompanyOpen)}
              className="flex items-center justify-between w-full px-4 py-3.5 text-[15px] font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span>{t("ourCompany")}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-gray-400 transition-transform duration-200",
                mobileCompanyOpen && "rotate-180"
              )} />
            </button>
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              mobileCompanyOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="pl-4 pr-2 py-2 space-y-1">
                {companyItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-[var(--header-accent)]/5 hover:text-[var(--header-accent)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Language Switcher */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("language")}</p>
            <div className="flex gap-2 px-4">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => switchLocale(loc)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    locale === loc
                      ? "bg-[var(--header-accent)] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {loc === "en" ? (
                    <svg className="w-5 h-4 rounded-[3px] overflow-hidden" viewBox="0 0 640 480">
                      <path fill="#012169" d="M0 0h640v480H0z"/>
                      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
                      <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
                      <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
                      <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-4 rounded-[3px] overflow-hidden" viewBox="0 0 640 480">
                      <path fill="#002654" d="M0 0h213.3v480H0z"/>
                      <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
                      <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
                    </svg>
                  )}
                  {loc === "en" ? "EN" : "FR"}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="pt-4 px-4">
            <Button
              asChild
              className="w-full bg-[var(--header-accent)] hover:bg-[var(--header-accent-hover)] text-white font-semibold h-12 rounded-full shadow-lg"
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
