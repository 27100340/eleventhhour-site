'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function AdminIndex() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const appMeta = data.session?.user?.app_metadata as Record<string, unknown> | undefined
      const role = typeof appMeta?.role === 'string' ? appMeta.role : undefined
      if (!data.session || role !== 'admin') router.replace('/admin/login')
      else router.replace('/admin/dashboard')
    })
  }, [router])
  return null
}
