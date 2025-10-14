'use client'

/**
 * Request a short‑lived signed URL from our API route.
 * Use when your bucket is private (recommended).
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  const res = await fetch('/api/storage/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path, expiresInSeconds }),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Failed to get signed URL: ${res.status}`)
  }
  const data = (await res.json()) as { url?: string; error?: string }
  if (!data.url) throw new Error(data.error || 'No URL returned')
  return data.url
}

/**
 * Build a public URL for objects when your bucket is Public.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

