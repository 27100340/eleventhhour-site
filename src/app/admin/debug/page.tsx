'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true } }
)

export default function Debug() {
  const [state, setState] = useState<any>({})
  useEffect(() => {
    (async () => {
      const sess = await supabase.auth.getSession()
      const role = sess.data.session?.user?.app_metadata?.role
      const { data, error } = await supabase.from('services').select('*').limit(1)
      setState({ role, error: error?.message ?? null, sample: data ?? [] })
      console.log('session', sess)
      console.log('select services error', error)
    })()
  }, [])
  return <pre className="p-4 text-xs">{JSON.stringify(state, null, 2)}</pre>
}
