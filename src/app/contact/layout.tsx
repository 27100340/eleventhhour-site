import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Eleventh Hour Cleaning | Book Trusted Cleaning & Maintenance Experts',
  description: 'Get in touch with Eleventh Hour Cleaning. Call, message, or book online to schedule premium cleaning and maintenance services for your home or business.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
