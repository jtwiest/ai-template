import type { Metadata } from 'next'
import { Inter, Source_Code_Pro } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-source-code-pro',
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
      <body className={`${inter.variable} ${sourceCodePro.variable} font-sans bg-background text-foreground`}>
        <Navigation />
        <main className="ml-16 min-h-screen">
          <div className="container mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}