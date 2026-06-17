import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Navbar from '@/components/navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Prompt4life',
    default: 'Prompt4life - The Leading AI Prompt Marketplace',
  },
  description: 'Discover, share, and use high-quality AI prompts for Midjourney, ChatGPT, DALL-E, and more. The most comprehensive library of expert prompt engineering techniques.',
  keywords: ['AI prompts', 'prompt engineering', 'ChatGPT prompts', 'Midjourney prompts', 'DALL-E prompts', 'AI marketplace', 'creative AI'],
  authors: [{ name: 'Prompt4life Team' }],
  openGraph: {
    title: 'Prompt4life - AI Prompt Marketplace',
    description: 'Find the best AI prompts for your creative projects.',
    url: 'https://prompt4life.com',
    siteName: 'Prompt4life',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt4life - AI Prompt Marketplace',
    description: 'Find the best AI prompts for your creative projects.',
    creator: '@prompt4life',
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <main className="min-h-screen bg-background flex flex-col items-center pt-[116px] md:pt-16">
            {children}
          </main>
          
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <footer className="w-full bg-muted/30 border-t pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <Link href="/" className="text-xl font-black tracking-tighter text-primary flex items-center gap-2">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                             Prompt4life
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                            The world's most advanced marketplace for high-performance AI prompts. Empowering creators to master the future of AI.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/search" className="hover:text-primary transition-colors">Browse Prompts</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider">Account</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
                            <li><Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
                            <li><Link href="/delete-account" className="hover:text-primary transition-colors text-destructive/70 hover:text-destructive">Delete Account</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Prompt4life. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">Discord</a>
                        <a href="#" className="hover:text-primary transition-colors">GitHub</a>
                    </div>
                </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
