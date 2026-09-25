import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Geist } from 'next/font/google'
import { Navbar } from '#components/navbar'
import { Toaster } from '#components/ui/sonner'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Dispact — Event Delivery Platform',
  description:
    'Asynchronous event ingestion, idempotency locking, and pluggable delivery gateway.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`font-sans ${geist.variable} dark`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
            Dispact
          </footer>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
