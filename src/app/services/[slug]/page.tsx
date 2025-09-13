import { notFound } from 'next/navigation'
import { getService } from '@/lib/services'

export default function ServicePage({ params }: { params: { slug: string } }) {
  const svc = getService(params.slug)
  if (!svc) return notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">{svc.name}</h1>
      <p className="mt-3 text-slate-700">{svc.blurb}</p>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {svc.images.map(src => (
          <img key={src} src={src} alt={svc.name} className="rounded-2xl shadow" />
        ))}
      </div>
    </div>
  )
}
