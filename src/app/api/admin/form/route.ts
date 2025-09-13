// src/app/api/admin/form/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabase(true)
    const { data, error } = await supabase
      .from('form_config')
      .select('config, updated_at')
      .eq('id', 'public')
      .single()
    if (error) return Response.json({ error }, { status: 400 })
    return Response.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: { message } }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = createServerSupabase(true) // service-role
    const body = await req.json()
    if (!body?.config || typeof body.config !== 'object') {
      return Response.json({ error: { message: 'config (object) required' } }, { status: 400 })
    }

    const { error } = await supabase
      .from('form_config')
      .update({ config: body.config })
      .eq('id', 'public')

    if (error) return Response.json({ error }, { status: 400 })

    // No caching on response to avoid any intermediate layer caching
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: { message } }, { status: 500 })
  }
}
