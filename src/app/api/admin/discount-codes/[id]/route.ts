// src/app/api/admin/discount-codes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = {
  params: Promise<{
    id: string
  }>
}

// GET - Get single discount code
export async function GET(req: NextRequest, props: Params) {
  const params = await props.params
  try {
    const supabase = createServerSupabase(true)

    const { data: code, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!code) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 })
    }

    return NextResponse.json({ code })
  } catch (error: any) {
    console.error('Error fetching discount code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discount code' },
      { status: 500 }
    )
  }
}

// PUT - Update discount code
export async function PUT(req: NextRequest, props: Params) {
  const params = await props.params
  try {
    const supabase = createServerSupabase(true)
    const body = await req.json()

    // Normalize code if provided
    if (body.code) {
      body.code = body.code.toUpperCase().trim()
    }

    const { data: code, error } = await supabase
      .from('discount_codes')
      .update(body)
      .eq('id', params.id)
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

    return NextResponse.json({ code })
  } catch (error: any) {
    console.error('Error updating discount code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update discount code' },
      { status: 500 }
    )
  }
}

// DELETE - Delete discount code
export async function DELETE(req: NextRequest, props: Params) {
  const params = await props.params
  try {
    const supabase = createServerSupabase(true)

    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting discount code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete discount code' },
      { status: 500 }
    )
  }
}
