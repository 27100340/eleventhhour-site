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
  const service =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (useServiceRole) {
    if (!service) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (server env)')
    return createClient(url, service, { auth: { persistSession: false } })
  }

  if (!anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, anon, { auth: { persistSession: false } })
}
