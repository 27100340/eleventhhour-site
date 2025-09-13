'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Wrench, Leaf, Paintbrush, Plug, Flame, Bug, KeySquare, Hammer, Refrigerator, Trees } from 'lucide-react'

const navServices = [
  { slug: 'cleaning', label: 'Cleaning', Icon: Paintbrush },
  { slug: 'gardening', label: 'Gardening', Icon: Leaf },
  { slug: 'handyman', label: 'Handyman', Icon: Wrench },
  { slug: 'plumbing-heating', label: 'Plumbing & Heating', Icon: Flame },
  { slug: 'gas-boiler', label: 'Gas & Boiler', Icon: Flame },
  { slug: 'electrical', label: 'Electrical', Icon: Plug },
  { slug: 'pest-control', label: 'Pest Control', Icon: Bug },
  { slug: 'locksmith', label: 'Locksmith', Icon: KeySquare },
  { slug: 'appliance-repair', label: 'Appliance Repair', Icon: Refrigerator },
  { slug: 'landscaping', label: 'Landscaping', Icon: Trees },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between py-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/el_logo.png" alt="Eleventh Hour Logo" width={160} height={40} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="text-sm font-medium hover:text-brand-600">Services</button>
            {open && (
              <div className="absolute left-0 mt-2 w-[560px] bg-white border rounded-2xl shadow-xl p-3 grid grid-cols-2 gap-2">
                {navServices.map(({ slug, label, Icon }) => (
                  <Link key={slug} href={`/services/${slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                    <Icon className="h-5 w-5 text-brand-600" />
                    <span className="text-sm">{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/contact" className="text-sm font-medium hover:text-brand-600">Contact Us</Link>
        </nav>

        <Link href="/book" className="ml-auto md:ml-0 btn-primary">Book Now</Link>
      </div>
    </header>
  )
}
