import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Returns a short‑lived signed URL for a private Storage object.
 * Use only on the server (route handlers, RSC, or server actions).
 */
export async function getSignedImageUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 60
) {
  const supabase = createServerSupabase(true) // service role
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds)

  if (error) throw error
  return data.signedUrl
}

/**
 * If you decide to make the bucket public, prefer this helper to build
 * the stable public URL without a server call.
 */
export function getPublicImageUrl(bucket: string, path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}

