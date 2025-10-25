'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Wrench, Leaf, Paintbrush, Plug, Flame, Bug, KeySquare, Hammer, Refrigerator, Trees, ChevronDown, Menu, X } from 'lucide-react'

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

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
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
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-stone/50 shadow-sm supports-[backdrop-filter]:bg-brand-cream/90 overflow-visible" style={{ willChange: 'transform' }}>
      <div className="mx-auto max-w-7xl flex items-center justify-between py-4 px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/el_logo.png"
              alt="Eleventh Hour Logo"
              className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <div
            ref={dropdownRef}
            className="relative z-[100]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber hover:bg-white/50 rounded-lg transition-colors duration-200 ${
                dropdownOpen ? 'bg-white/50 text-brand-amber' : ''
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Services
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-[620px] bg-white border border-gray-200/80 rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden z-[100]">
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {navServices.map(({ slug, label, Icon, desc }) => (
                      <Link
                        key={slug}
                        href={`/services/${slug}`}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-brand-sage/40 rounded-lg flex items-center justify-center group-hover:bg-brand-sage/60 transition-colors">
                          <Icon className="h-5 w-5 text-brand-amber" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-charcoal group-hover:text-brand-amber transition-colors">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">

                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="px-4 py-2 text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber hover:bg-white/50 rounded-lg transition-colors duration-200"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="px-4 py-2 text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber hover:bg-white/50 rounded-lg transition-colors duration-200"
          >
            Contact
          </Link>

          <Link
            href="/careers"
            className="px-4 py-2 text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber hover:bg-white/50 rounded-lg transition-colors duration-200"
          >
            Careers
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-brand-charcoal hover:text-brand-amber hover:bg-white/50 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* CTA Button - Brand Amber */}
        <div className="hidden lg:block">
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-montserrat font-semibold uppercase tracking-wider text-white bg-brand-amber hover:bg-brand-amber-dark rounded-xl shadow-lg hover:shadow-xl transition-colors duration-200 transition-transform hover:-translate-y-0.5"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-cream border-t border-brand-stone">
          <div className="px-6 py-4 space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-montserrat font-semibold text-gray-600 uppercase tracking-wide">Services</p>
              <div className="grid grid-cols-1 gap-1">
                {navServices.slice(0, 6).map(({ slug, label, Icon }) => (
                  <Link
                    key={slug}
                    href={`/services/${slug}`}
                    className="flex items-center gap-3 p-3 text-sm font-montserrat text-brand-charcoal hover:text-brand-amber hover:bg-white/50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-brand-amber" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-brand-stone space-y-2">
              <Link
                href="/about"
                className="block text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber py-2 px-3 rounded-lg hover:bg-white/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber py-2 px-3 rounded-lg hover:bg-white/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/careers"
                className="block text-sm font-montserrat font-medium text-brand-charcoal hover:text-brand-amber py-2 px-3 rounded-lg hover:bg-white/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
              </Link>
            </div>

            <div className="pt-3">
              <Link
                href="/book"
                className="flex items-center justify-center w-full px-6 py-3 text-sm font-montserrat font-semibold uppercase tracking-wider text-white bg-brand-amber hover:bg-brand-amber-dark rounded-xl shadow-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
