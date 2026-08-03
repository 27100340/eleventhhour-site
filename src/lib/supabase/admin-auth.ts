// src/lib/supabase/admin-auth.ts
// Server-side guard for /api/admin/* routes. Verifies the Supabase JWT sent
// by the admin UI (via adminFetch) and requires app_metadata.role === 'admin'.
import { createClient, type User } from '@supabase/supabase-js'

export async function getAdminUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null

  const supabase = createClient(url, anon, { auth: { persistSession: false } })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  if (data.user.app_metadata?.role !== 'admin') return null
  return data.user
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
