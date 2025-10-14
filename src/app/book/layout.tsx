import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Premium Cleaning or Maintenance Service | Eleventh Hour Cleaning',
  description: 'Book your next cleaning, gardening, or maintenance service online in minutes. Trusted professionals, guaranteed satisfaction.',
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
