import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/el_logo.png" alt="EleventhHour" className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="font-montserrat text-sm text-brand-cream/90 leading-relaxed mb-6 max-w-lg">
              London's trusted name for immaculate homes and pristine workspaces. Expert cleaning, gardening, and maintenance tailored for premium lifestyles.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-brand-cream/80">
                <Phone className="h-4 w-4 text-brand-amber" />
                <a href="tel:02080000000" className="font-montserrat text-sm hover:text-brand-amber transition-colors">
                  020 8000 0000
                </a>
              </div>
              <div className="flex items-center gap-3 text-brand-cream/80">
                <Mail className="h-4 w-4 text-brand-amber" />
                <a href="mailto:hello@eleventhhour.co.uk" className="font-montserrat text-sm hover:text-brand-amber transition-colors">
                  hello@eleventhhour.co.uk
                </a>
              </div>
              <div className="flex items-center gap-3 text-brand-cream/80">
                <MapPin className="h-4 w-4 text-brand-amber" />
                <span className="font-montserrat text-sm">Greater London & Surrounding Areas</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-lora text-lg font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/services/cleaning" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Cleaning</Link></li>
              <li><Link href="/services/gardening" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Gardening</Link></li>
              <li><Link href="/services/handyman" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Handyman</Link></li>
              <li><Link href="/services/plumbing-heating" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Plumbing</Link></li>
              <li><Link href="/services/electrical" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Electrical</Link></li>
              <li><Link href="/services/locksmith" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Locksmith</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-lora text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Contact</Link></li>
              <li><Link href="/book" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Book Now</Link></li>
              <li><Link href="/privacy" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="font-montserrat text-sm text-brand-cream/80 hover:text-brand-amber transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-cream/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <p className="font-montserrat text-brand-cream/60 text-sm">
                © {new Date().getFullYear()} EleventhHour. All rights reserved.
              </p>
              <div className="flex items-center gap-3">
                <span className="font-montserrat text-brand-cream/60 text-xs">Secure payments powered by</span>
                <img src="/stripe.png" alt="Stripe" className="h-6 w-auto" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="font-montserrat text-brand-cream/60 text-sm">Follow us:</span>
              <div className="flex items-center gap-4">
              <a href="#" className="text-brand-cream/60 hover:text-brand-amber transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-brand-cream/60 hover:text-brand-amber transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-brand-cream/60 hover:text-brand-amber transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
