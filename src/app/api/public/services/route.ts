// src/app/api/public/services/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Public read with ANON key; RLS must allow select where active = true
    const supabase = createServerSupabase(false)

    const { data, error } = await supabase
      .from('services')
      .select('id, name, price, time_minutes, active')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      })
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: { message: e?.message || 'Unexpected error' } }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    })
  }
}
