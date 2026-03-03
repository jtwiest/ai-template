import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/contexts'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI MVP Template',
  description: 'A flexible template for AI-powered applications with chat, artifacts, and workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans bg-background text-foreground`}>
        <AppProviders>
          <main className="min-h-screen">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  )
}