import './globals.css'
import type { Metadata } from 'next'
import { ModeProvider } from '@/components/ModeContext'
import TopSelectorBar from '@/components/TopSelectorBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Premium Residential & Commercial Cleaning | Eleventh Hour Cleaning UK',
  description: 'Discover Eleventh Hour Cleaning — London\'s trusted name for immaculate homes and pristine workspaces. Expert cleaning, gardening, and maintenance tailored for premium lifestyles.',
  keywords: 'premium cleaning London, residential cleaning, commercial cleaning, professional cleaning services, gardening services, property maintenance, London cleaning company',
  authors: [{ name: 'Eleventh Hour Cleaning' }],
  openGraph: {
    title: 'Premium Residential & Commercial Cleaning | Eleventh Hour Cleaning UK',
    description: 'Discover Eleventh Hour Cleaning — London\'s trusted name for immaculate homes and pristine workspaces. Expert cleaning, gardening, and maintenance tailored for premium lifestyles.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/el_logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
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
