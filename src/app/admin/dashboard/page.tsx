'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import ServicesTab from '@/components/admin/ServicesTab'
import FormBuilderTab from '@/components/admin/FormBuilderTab'
import BookingsTab from '@/components/admin/BookingsTab'
import CreateBookingTab from '@/components/admin/CreateBookingTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'

type Tab = 'services'|'form'|'bookings'|'create'|'analytics'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('services')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const appMeta = data.session?.user?.app_metadata as Record<string, unknown> | undefined
      const role = typeof appMeta?.role === 'string' ? appMeta.role : undefined
      if (!data.session || role !== 'admin') router.replace('/admin/login')
    })
  }, [router])

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Eleventh Hour Admin Portal</h1>
        <button
          onClick={async()=>{ await supabase.auth.signOut(); router.replace('/admin/login') }}
          className="rounded-full border px-4 py-2 text-sm"
        >Sign out</button>
      </div>

      <div className="mt-6 flex gap-2 flex-wrap">
        {(['services','form','bookings','create','analytics'] as Tab[]).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
              tab===t
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}>
            {t === 'create' ? 'Create Booking' : t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab==='services' && <ServicesTab/>}
        {tab==='form' && <FormBuilderTab/>}
        {tab==='bookings' && <BookingsTab/>}
        {tab==='create' && <CreateBookingTab/>}
        {tab==='analytics' && <AnalyticsTab/>}
      </div>
    </div>
  )
}
