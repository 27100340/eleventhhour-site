import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Archivo, Instrument_Sans } from 'next/font/google'
import { ModeProvider } from '@/components/ModeContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FacebookPixel } from '@/components/FacebookPixel'
import { ToastProvider } from '@/components/ui/Toast'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: 'Premium Residential & Commercial Cleaning | Eleventh Hour Cleaning UK',
  description: 'Discover Eleventh Hour Cleaning — London\'s trusted name for immaculate homes and pristine workspaces. Expert cleaning, gardening, and maintenance tailored for premium lifestyles.',
  keywords: 'premium cleaning London, residential cleaning, commercial cleaning, professional cleaning services, gardening services, property maintenance, London cleaning company',
  authors: [{ name: 'Eleventh Hour Cleaning' }],
  icons: { icon: '/el_logo.png' },
  openGraph: {
    title: 'Premium Residential & Commercial Cleaning | Eleventh Hour Cleaning UK',
    description: 'Discover Eleventh Hour Cleaning — London\'s trusted name for immaculate homes and pristine workspaces. Expert cleaning, gardening, and maintenance tailored for premium lifestyles.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrumentSans.variable}`}>
      <head>
        <FacebookPixel />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
        <ModeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </ModeProvider>
      </body>
    </html>
  )
}
