// src/lib/use-admin-guard.ts
// Client-side gate for admin pages: redirects to /admin/login unless the current
// session belongs to a user with app_metadata.role === 'admin'.
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/browser'

export function useAdminGuard() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const appMeta = data.session?.user?.app_metadata as Record<string, unknown> | undefined
      const role = typeof appMeta?.role === 'string' ? appMeta.role : undefined
      if (!data.session || role !== 'admin') router.replace('/admin/login')
    })
  }, [router])
}
