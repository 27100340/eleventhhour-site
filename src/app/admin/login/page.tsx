'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/browser'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // If already authed + admin, go straight to dashboard
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const role = data.session?.user?.app_metadata?.role
      if (role === 'admin') router.replace('/admin/dashboard')
    })()
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      // Always clear any stale session first
      await supabase.auth.signOut()

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setErr(error.message)
        return
      }

      // Fetch fresh session to get the latest JWT with app_metadata
      const sess = await supabase.auth.getSession()
      const role = sess.data.session?.user?.app_metadata?.role

      if (role !== 'admin') {
        setErr('This account is not an admin (missing app_metadata.role = "admin").')
        return
      }

      router.replace('/admin/dashboard')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unexpected error during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-24 pb-16">
      <div className="rounded-(--radius-card) border border-line bg-surface p-8">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-3 text-2xl">Sign in</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            autoComplete="email"
          />
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button className="btn-primary py-3" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {err && <p className="whitespace-pre-wrap text-sm font-medium text-red-700">{err}</p>}
          <p className="text-xs text-ink-faint">
            Tip: after changing App Metadata in the dashboard, you must sign out &amp; back in so the
            JWT includes the new role.
          </p>
        </form>
      </div>
    </div>
  )
}
