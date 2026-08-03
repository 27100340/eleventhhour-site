import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getService, SERVICES } from '@/lib/services'
import Link from 'next/link'
import { Check, Info } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) return {}
  return {
    title: `${svc.name} Services in London | Eleventh Hour Cleaning`,
    description: svc.blurb,
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) return notFound()

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Our services</p>
            <h1 className="mt-4">{svc.name}</h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">{svc.blurb}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn-primary px-6 py-3 text-base">
              Book {svc.name.toLowerCase()}
            </Link>
            <Link href="/contact" className="btn-secondary px-6 py-3 text-base">
              Request a quote
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className="tick-rule" />
      </section>

      {/* Sub-services */}
      {svc.subServices && svc.subServices.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2>What&rsquo;s included</h2>
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {svc.subServices.map((subService) => (
                <li key={subService} className="card flex items-center gap-3.5 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint">
                    <Check className="h-4 w-4 text-accent" />
                  </span>
                  <span className="font-medium text-ink">{subService}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Special note */}
      {svc.specialNote && (
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-start gap-4 rounded-(--radius-card) bg-accent-tint p-6">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h3 className="text-base text-accent-dark">Good to know</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-accent-dark/90">{svc.specialNote}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-ink text-paper">
        <div aria-hidden="true" className="tick-rule opacity-40" />
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-paper">Ready to book your {svc.name.toLowerCase()} service?</h2>
              <p className="mt-2 text-paper/70">
                Get started today with professional service from trusted experts.
              </p>
            </div>
            <div className="md:text-right">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 rounded-(--radius-ctl) bg-paper px-6 py-3 text-base font-semibold text-ink transition-colors duration-150 hover:bg-white"
              >
                Book now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
