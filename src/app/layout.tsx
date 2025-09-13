import './globals.css'
import type { Metadata } from 'next'
import { ModeProvider } from '@/components/ModeContext'
import TopSelectorBar from '@/components/TopSelectorBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'EleventhHour Cleaning Services',
  description: 'UK-based  & commercial cleaning.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/el_logo.png" type="image/png" />
        {/* ...other head tags... */}
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-900">
        <ModeProvider>
          <TopSelectorBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ModeProvider>
      </body>
    </html>
  )
}
