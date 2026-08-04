import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Admin · Eleventh Hour' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper">{children}</div>
}
