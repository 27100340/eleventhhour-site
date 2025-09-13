'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function AdminIndex() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = (data.session?.user?.app_metadata as any)?.role
      if (!data.session || role !== 'admin') router.replace('/admin/login')
      else router.replace('/admin/dashboard')
    })
  }, [router])
  return null
}
