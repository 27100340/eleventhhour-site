// src/app/api/admin/discount-codes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List all discount codes
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase(true)

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    // Build query
    let query = supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('active', true)
    }

    const { data: codes, error } = await query

    if (error) throw error

    return NextResponse.json({ codes })
  } catch (error: any) {
    console.error('Error fetching discount codes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discount codes' },
      { status: 500 }
    )
  }
}

// POST - Create new discount code
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase(true)
    const body = await req.json()

    // Validate required fields
    if (!body.code || !body.discount_type || !body.discount_value) {
      return NextResponse.json(
        { error: 'Missing required fields: code, discount_type, discount_value' },
        { status: 400 }
      )
    }

    // Normalize code to uppercase
    const normalizedCode = body.code.toUpperCase().trim()

    // Create discount code
    const { data: code, error } = await supabase
      .from('discount_codes')
      .insert({
        code: normalizedCode,
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_order_amount: body.min_order_amount || 0,
        max_discount_amount: body.max_discount_amount || null,
        usage_limit: body.usage_limit || null,
        valid_from: body.valid_from || new Date().toISOString(),
        valid_until: body.valid_until || null,
        active: body.active !== undefined ? body.active : true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Discount code already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ code }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating discount code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create discount code' },
      { status: 500 }
    )
  }
}
