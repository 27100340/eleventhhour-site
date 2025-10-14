Supabase Storage setup and secure image usage

1) Create a private bucket
- In Supabase Dashboard → Storage → Create bucket
- Name example: `website-images`
- Disable “Public bucket” (keep it private)

2) Upload files
- Create folders like `hero/`, `services/`, etc.
- Upload your images as `services/cleaning/hero.jpg`, etc.

3) Environment vars (in `.env.local`)
- NEXT_PUBLIC_SUPABASE_URL=your-project-url
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
- SUPABASE_SERVICE_ROLE=your-service-role-key  # server-only, never expose to browser

4) Generate short‑lived signed URLs (private bucket)
- Use the provided server helper: `src/lib/storage/server.ts`
- Example in a Server Component:

  ```tsx
  import { getSignedImageUrl } from '@/lib/storage/server'

  export default async function Example() {
    const url = await getSignedImageUrl('website-images', 'services/cleaning/hero.jpg', 3600)
    return <img src={url} alt="Hero" />
  }
  ```

5) Or via API route (client usage)
- POST `/api/storage/signed-url` with JSON `{ bucket, path, expiresInSeconds }`
- Returns `{ url }` signed for temporary access

6) If you prefer public access
- Make the bucket Public, then build URLs like:
  `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
- Use `getPublicImageUrl()` helper in `src/lib/storage/server.ts`

7) Security notes
- Keep `SUPABASE_SERVICE_ROLE` only on the server.
- Signed URLs expire; re-request them when needed.
- For caching, set appropriate cache headers on the page or image component.

