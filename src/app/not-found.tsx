import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <p className="eyebrow">404</p>
          <h1 className="mt-4">This page missed its appointment</h1>
          <p className="mt-5 text-lg text-ink-soft">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you back
            somewhere useful.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn-primary px-6 py-3 text-base">
              Back to home
            </Link>
            <Link href="/book" className="btn-secondary px-6 py-3 text-base">
              Book a service
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className="tick-rule mt-16" />
      </div>
    </div>
  )
}
