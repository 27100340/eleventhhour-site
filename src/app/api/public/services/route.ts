// src/app/api/public/services/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Utility function to build hierarchical structure from flat data
function buildServiceHierarchy(services: any[]) {
  const serviceMap = new Map()
  const roots: any[] = []

  // First pass: create map of all services
  services.forEach(service => {
    serviceMap.set(service.id, { ...service, children: [] })
  })

  // Second pass: build hierarchy
  services.forEach(service => {
    const node = serviceMap.get(service.id)
    if (service.parent_id && serviceMap.has(service.parent_id)) {
      const parent = serviceMap.get(service.parent_id)
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const hierarchical = searchParams.get('hierarchical') === 'true'

    // Public read with ANON key; RLS must allow select where active = true
    const supabase = createServerSupabase(false)

    const { data, error } = await supabase
      .from('services')
      .select('id, name, price, time_minutes, active, order_index, question_type, dropdown_options, parent_id, is_category, category_type, nesting_level, per_unit_type')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      })
    }

    // Return hierarchical structure if requested, otherwise flat list
    const responseData = hierarchical ? buildServiceHierarchy(data || []) : data

    return new Response(JSON.stringify({ data: responseData }), {
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
