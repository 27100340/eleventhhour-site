// src/lib/admin-fetch.ts
// fetch wrapper for the admin UI: attaches the Supabase session JWT so
// /api/admin/* routes can verify the caller is an admin.
import { supabase } from '@/lib/supabase/browser'

export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(init.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  return fetch(input, { ...init, headers })
}
