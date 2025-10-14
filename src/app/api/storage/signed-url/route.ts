import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// POST /api/storage/signed-url
// Body: { bucket: string; path: string; expiresInSeconds?: number }
export async function POST(req: NextRequest) {
  try {
    const { bucket, path, expiresInSeconds = 60 * 60 } = await req.json()
    if (!bucket || !path) {
      return NextResponse.json({ error: 'bucket and path are required' }, { status: 400 })
    }

    // Use service role to sign URLs for private buckets. Never expose this key to the client.
    const supabase = createServerSupabase(true)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Failed to create signed URL' }, { status: 500 })
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

