// src/app/api/public/validate-discount/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase(false)
    const body = await req.json()

    const { code, orderAmount } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      )
    }

    // Normalize code
    const normalizedCode = code.toUpperCase().trim()

    // Fetch discount code
    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('active', true)
      .single()

    if (error || !discountCode) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid discount code'
        },
        { status: 200 }
      )
    }

    // Check if code is valid
    const now = new Date()
    const validFrom = discountCode.valid_from ? new Date(discountCode.valid_from) : null
    const validUntil = discountCode.valid_until ? new Date(discountCode.valid_until) : null

    // Check valid date range
    if (validFrom && now < validFrom) {
      return NextResponse.json({
        valid: false,
        error: 'This discount code is not yet active'
      })
    }

    if (validUntil && now > validUntil) {
      return NextResponse.json({
        valid: false,
        error: 'This discount code has expired'
      })
    }

    // Check usage limit
    if (discountCode.usage_limit && discountCode.times_used >= discountCode.usage_limit) {
      return NextResponse.json({
        valid: false,
        error: 'This discount code has reached its usage limit'
      })
    }

    // Check minimum order amount
    if (orderAmount && discountCode.min_order_amount > 0) {
      if (orderAmount < discountCode.min_order_amount) {
        return NextResponse.json({
          valid: false,
          error: `Minimum order amount of £${discountCode.min_order_amount.toFixed(2)} required`
        })
      }
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discountCode.discount_type === 'percentage') {
      discountAmount = (orderAmount * discountCode.discount_value) / 100
      // Apply max discount cap if exists
      if (discountCode.max_discount_amount && discountAmount > discountCode.max_discount_amount) {
        discountAmount = discountCode.max_discount_amount
      }
    } else if (discountCode.discount_type === 'fixed') {
      discountAmount = discountCode.discount_value
    }

    // Ensure discount doesn't exceed order amount
    if (orderAmount && discountAmount > orderAmount) {
      discountAmount = orderAmount
    }

    return NextResponse.json({
      valid: true,
      code: discountCode.code,
      description: discountCode.description,
      discount_type: discountCode.discount_type,
      discount_value: discountCode.discount_value,
      discount_amount: Number(discountAmount.toFixed(2)),
      min_order_amount: discountCode.min_order_amount,
      max_discount_amount: discountCode.max_discount_amount,
    })
  } catch (error: any) {
    console.error('Error validating discount code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate discount code' },
      { status: 500 }
    )
  }
}
