'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import ServicesTab from '@/components/admin/ServicesTab'
import FormBuilderTab from '@/components/admin/FormBuilderTab'
import BookingsTab from '@/components/admin/BookingsTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'

type Tab = 'services'|'form'|'bookings'|'analytics'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('services')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = (data.session?.user?.app_metadata as any)?.role
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

      <div className="mt-6 flex gap-2">
        {(['services','form','bookings','analytics'] as Tab[]).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-full border text-sm ${tab===t?'bg-brand-600 text-white border-brand-600':'bg-white'}`}>
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab==='services' && <ServicesTab/>}
        {tab==='form' && <FormBuilderTab/>}
        {tab==='bookings' && <BookingsTab/>}
        {tab==='analytics' && <AnalyticsTab/>}
      </div>
    </div>
  )
}
