// src/app/api/public/form/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // anon read is fine for public form config
    const supabase = createServerSupabase(false)

    const { data, error } = await supabase
      .from('form_config')
      .select('config, updated_at')
      .eq('id', 'public')
      .single()

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
