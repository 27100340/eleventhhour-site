'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Layers,
  SlidersHorizontal,
  CalendarDays,
  CirclePlus,
  Tag,
  BarChart3,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/browser'
import { useAdminGuard } from '@/lib/use-admin-guard'
import ServicesTab from '@/components/admin/ServicesTab'
import FormBuilderTab from '@/components/admin/FormBuilderTab'
import BookingsTab from '@/components/admin/BookingsTab'
import CreateBookingTab from '@/components/admin/CreateBookingTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'
import DiscountCodesTab from '@/components/admin/DiscountCodesTab'

type Tab = 'services' | 'form' | 'bookings' | 'create' | 'discounts' | 'analytics'

const navItems: { key: Tab; label: string; Icon: LucideIcon }[] = [
  { key: 'services', label: 'Services', Icon: Layers },
  { key: 'form', label: 'Form builder', Icon: SlidersHorizontal },
  { key: 'bookings', label: 'Bookings', Icon: CalendarDays },
  { key: 'create', label: 'Create booking', Icon: CirclePlus },
  { key: 'discounts', label: 'Discount codes', Icon: Tag },
  { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
]

export default function AdminDashboard() {
  useAdminGuard()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('services')

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-max">
          <p className="eyebrow px-2">Admin portal</p>
          <nav className="mt-3 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map(({ key, label, Icon }) => {
              const active = tab === key
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-(--radius-ctl) px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-accent-tint text-accent-dark'
                      : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-ink-faint'}`} />
                  {label}
                </button>
              )
            })}
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.replace('/admin/login')
              }}
              className="flex w-full items-center gap-2.5 rounded-(--radius-ctl) px-3 py-2 text-left text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
            >
              <LogOut className="h-4 w-4 text-ink-faint" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === 'services' && <ServicesTab />}
          {tab === 'form' && <FormBuilderTab />}
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'create' && <CreateBookingTab />}
          {tab === 'discounts' && <DiscountCodesTab />}
          {tab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  )
}
