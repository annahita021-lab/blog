"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { Menu, X, ChevronDown, MessageCircle, LayoutGrid, Building2, Wrench, Users, FileText, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { routing } from "@/i18n/routing"

const COLORS = {
  bg: "#FDFBF5",
  burgundy: "#722F37",
  burgundyHover: "#5a252c",
  text: "#1a1a1a",
  textMuted: "#4a4a4a",
}

interface NavItemProps {
  label: string
  href: string
  hasDropdown: boolean
  dropdownItems?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
}

function NavDropdown({
  item,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  item: NavItemProps
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onMouseEnter()
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onMouseLeave()
    }, 150)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors",
          isOpen ? "text-[#722F37]" : ""
        )}
        style={{ color: isOpen ? COLORS.burgundy : COLORS.textMuted }}
      >
        {item.label}
        {item.hasDropdown && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Link>

      {item.hasDropdown && item.dropdownItems && (
        <div
          className={cn(
            "absolute top-full left-0 pt-2 transition-all duration-200 ease-out",
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <div
            className="min-w-[220px] rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="py-2">
              {item.dropdownItems.map((dropdownItem) => {
                const Icon = dropdownItem.icon
                return (
                  <Link
                    key={dropdownItem.label}
                    href={dropdownItem.href}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium transition-colors hover:bg-gray-50"
                    style={{ color: COLORS.textMuted }}
                  >
                    <Icon className="h-5 w-5 text-gray-400" />
                    {dropdownItem.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const t = useTranslations("Nav")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const productsDropdown = [
    { label: t("propertyManagement"), href: "#property-management", icon: Building2 },
    { label: t("maintenanceTools"), href: "#maintenance", icon: Wrench },
    { label: t("allProducts"), href: "#all-products", icon: LayoutGrid },
  ]

  const companyDropdown = [
    { label: t("aboutUs"), href: "#about", icon: Users },
    { label: t("blog"), href: "/", icon: FileText },
    { label: t("contact"), href: "#contact", icon: Mail },
  ]

  const navItems: NavItemProps[] = [
    { label: t("products"), href: "#products", hasDropdown: true, dropdownItems: productsDropdown },
    { label: t("pricing"), href: "#pricing", hasDropdown: false },
    { label: t("blog"), href: "/", hasDropdown: false },
    { label: t("ourCompany"), href: "#company", hasDropdown: true, dropdownItems: companyDropdown },
  ]

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null)
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
        isScrolled ? "shadow-sm" : ""
      )}
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Property Care App"
              width={140}
              height={56}
              className="h-14 w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.hasDropdown ? (
                <NavDropdown
                  key={item.label}
                  item={item}
                  isOpen={openDropdown === item.label}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                />
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors hover:text-[#722F37]"
                  style={{ color: COLORS.textMuted }}
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
                className="flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium transition-colors hover:text-[#722F37]"
                style={{ color: COLORS.textMuted }}
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
              >
                <span className="text-base">{locale === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", langMenuOpen && "rotate-180")} />
              </button>
              {langMenuOpen ? (
                <ul
                  className="absolute right-0 top-full mt-1 min-w-[140px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg z-50"
                  role="listbox"
                >
                  {routing.locales.map((loc) => (
                    <li key={loc}>
                      <button
                        type="button"
                        role="option"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => switchLocale(loc)}
                      >
                        {loc === "en" ? t("english") : t("french")}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center w-11 h-11 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: COLORS.text }}
              aria-label={t("chat")}
            >
              <MessageCircle className="h-5 w-5 text-white" strokeWidth={2} />
            </button>

            <Link
              href="#quote"
              className="inline-flex items-center justify-center h-11 px-6 text-[15px] font-semibold text-white rounded-full transition-colors"
              style={{ backgroundColor: COLORS.burgundy }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.burgundyHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.burgundy
              }}
            >
              {t("requestQuote")}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: COLORS.text }}
            aria-label={t("toggleMenu")}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-[600px] border-t border-gray-200" : "max-h-0"
        )}
        style={{ backgroundColor: COLORS.bg }}
      >
        <div className="px-6 py-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.hasDropdown ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMobileItem(
                        expandedMobileItem === item.label ? null : item.label
                      )
                    }
                    className="flex items-center justify-between w-full px-4 py-3 text-[15px] font-medium rounded-lg transition-colors"
                    style={{ color: COLORS.textMuted }}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expandedMobileItem === item.label && "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-out",
                      expandedMobileItem === item.label ? "max-h-[300px]" : "max-h-0"
                    )}
                  >
                    <div className="pl-4 py-1 space-y-1">
                      {item.dropdownItems?.map((subItem) => {
                        const Icon = subItem.icon
                        return (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors"
                            style={{ color: COLORS.textMuted }}
                          >
                            <Icon className="h-5 w-5 text-gray-400" />
                            {subItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-[15px] font-medium rounded-lg transition-colors"
                  style={{ color: COLORS.textMuted }}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          <div className="space-y-1 pt-2 border-t border-gray-100">
            <p className="px-4 text-xs text-muted-foreground uppercase tracking-wide">{t("language")}</p>
            {routing.locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => switchLocale(loc)}
                className="flex items-center gap-2 w-full px-4 py-3 text-[15px] font-medium rounded-lg transition-colors text-left"
                style={{ color: COLORS.textMuted }}
              >
                {loc === "en" ? t("english") : t("french")}
              </button>
            ))}
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center w-11 h-11 rounded-full"
              style={{ backgroundColor: COLORS.text }}
              aria-label={t("chat")}
            >
              <MessageCircle className="h-5 w-5 text-white" strokeWidth={2} />
            </button>

            <Link
              href="#quote"
              className="flex-1 inline-flex items-center justify-center h-11 px-6 text-[15px] font-semibold text-white rounded-full transition-colors"
              style={{ backgroundColor: COLORS.burgundy }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("requestQuote")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
