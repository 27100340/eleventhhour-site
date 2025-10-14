'use client'
import { useEffect, useState } from 'react'
import { getSignedUrl, getPublicUrl } from '@/lib/storage/client'

type Props = {
  bucket: string
  path: string
  alt: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  usePublicUrl?: boolean // set true if your bucket is public
}

// simple in-memory cache for this session
const cache = new Map<string, string>()

export default function SignedImage({ bucket, path, alt, className, style, usePublicUrl }: Props) {
  const key = `${bucket}:${path}:${usePublicUrl ? 'public' : 'signed'}`
  const [url, setUrl] = useState<string | null>(cache.get(key) || null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const u = usePublicUrl ? getPublicUrl(bucket, path) : await getSignedUrl(bucket, path)
        if (!active) return
        cache.set(key, u)
        setUrl(u)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || 'Failed to load image')
      }
    }
    if (!url) load()
    return () => { active = false }
  }, [bucket, path, usePublicUrl, key, url])

  if (error) return null
  if (!url) return <div className={className} style={style} aria-hidden />
  return <img src={url} alt={alt} className={className} style={style} />
}

