import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Navbar from '@/components/navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import Script from 'next/script'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prompt4life',
  description: 'AI Prompt Marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="max-w-[100vw] overflow-x-hidden">
      <body suppressHydrationWarning className={`${inter.className} max-w-[100vw] overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#22c55e" showSpinner={false} />
          <Navbar />
          <main className="min-h-screen bg-background flex flex-col items-center">
            {children}
          </main>
          
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/delete-account" className="hover:underline hover:text-foreground transition-colors">Delete Account</Link>
              <span className="w-full sm:w-auto mt-2 sm:mt-0">&copy; {new Date().getFullYear()} Prompt4life. All rights reserved.</span>
            </div>
          </footer>
        </ThemeProvider>

        {/* Google AdSense Global Script */}
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
      </body>
    </html>
  )
}
