import { createServerSupabase } from '@/lib/supabase/server'
export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.from('services').select('*').eq('active', true).order('name')
  return new Response(JSON.stringify({ data, error }), { headers: { 'content-type': 'application/json' } })
}
