'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Wrench, Leaf, Paintbrush, Plug, Flame, Bug, KeySquare, Refrigerator, Trees, ChevronDown, Menu, X } from 'lucide-react'

const navServices = [
  { slug: 'cleaning', label: 'Cleaning', Icon: Paintbrush, desc: 'Professional cleaning services' },
  { slug: 'gardening', label: 'Gardening', Icon: Leaf, desc: 'Garden maintenance & landscaping' },
  { slug: 'handyman', label: 'Handyman', Icon: Wrench, desc: 'Small repairs & odd jobs' },
  { slug: 'plumbing-heating', label: 'Plumbing & Heating', Icon: Flame, desc: 'Plumbing repairs & installations' },
  { slug: 'gas-boiler', label: 'Gas & Boiler', Icon: Flame, desc: 'Gas safety & boiler servicing' },
  { slug: 'electrical', label: 'Electrical', Icon: Plug, desc: 'Electrical work & fault finding' },
  { slug: 'pest-control', label: 'Pest Control', Icon: Bug, desc: 'Pest removal & prevention' },
  { slug: 'locksmith', label: 'Locksmith', Icon: KeySquare, desc: '24/7 lockout & security services' },
  { slug: 'appliance-repair', label: 'Appliance Repair', Icon: Refrigerator, desc: 'Home appliance diagnostics' },
  { slug: 'landscaping', label: 'Landscaping', Icon: Trees, desc: 'Complete landscaping projects' },
]

const pageLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/careers', label: 'Careers' },
]

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 150)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <img src="/el_logo.png" alt="Eleventh Hour" className="h-9 w-auto md:h-10" />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 rounded-(--radius-ctl) px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                dropdownOpen ? 'text-ink bg-ink/5' : 'text-ink-soft hover:text-ink'
              }`}
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Services
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-[600px] overflow-hidden rounded-(--radius-card) border border-line bg-surface shadow-soft">
                <div className="grid grid-cols-2 gap-1 p-3">
                  {navServices.map(({ slug, label, Icon, desc }) => (
                    <Link
                      key={slug}
                      href={`/services/${slug}`}
                      className="group flex items-start gap-3.5 rounded-(--radius-ctl) p-3 transition-colors duration-150 hover:bg-paper"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-ctl) bg-accent-tint">
                        <Icon className="h-4.5 w-4.5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{label}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pageLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-(--radius-ctl) px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/book" className="btn-primary hidden lg:inline-flex">
            Book now
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-(--radius-ctl) p-2 text-ink transition-colors hover:bg-ink/5 lg:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-line bg-paper lg:hidden">
          <div className="max-h-[calc(100vh-4rem)] space-y-4 overflow-y-auto px-6 py-4">
            <div>
              <p className="eyebrow mb-2">Services</p>
              <div className="grid grid-cols-1 gap-0.5">
                {navServices.map(({ slug, label, Icon }) => (
                  <Link
                    key={slug}
                    href={`/services/${slug}`}
                    className="flex items-center gap-3 rounded-(--radius-ctl) p-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-accent" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-0.5 border-t border-line pt-3">
              {pageLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-(--radius-ctl) px-2.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link
              href="/book"
              className="btn-primary w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
