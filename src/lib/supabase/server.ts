// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client.
 * - When useServiceRole=true, it MUST use SUPABASE_SERVICE_ROLE.
 * - Throws early if env vars are missing.
 * - Logs a safe fingerprint in dev so we can confirm which key is used.
 */
export function createServerSupabase(useServiceRole = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (useServiceRole) {
    if (!service) throw new Error('Missing SUPABASE_SERVICE_ROLE (server env)')
    if (process.env.NODE_ENV !== 'production') {
      console.log('[supabase] USING SERVICE ROLE in server route. key len:', service.length)
    }
    return createClient(url, service)
  }

  if (!anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (process.env.NODE_ENV !== 'production') {
    console.log('[supabase] using ANON in server route. key len:', anon.length)
  }
  return createClient(url, anon)
}
