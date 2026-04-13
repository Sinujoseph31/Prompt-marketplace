'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

export default function AdSenseScript() {
  const pathname = usePathname()

  // Pages where AdSense should be completely disabled (auto-ads and manual units).
  // This prevents violations related to "screens without content" or "navigation/alert screens".
  const disabledRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/update-password',
    '/submit',
    '/search',
    '/delete-account',
    '/profile',
    '/admin',
    '/user',
    '/arena',
    '/ai-tools'
  ]

  // Check if current path exact matches or starts with disabled route (like /edit/[id] or /admin/...)
  const shouldDisable = disabledRoutes.some(route => pathname === route || pathname?.startsWith(`${route}/`) || pathname?.startsWith('/edit/'))

  if (shouldDisable || !process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
    return null
  }

  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
      crossOrigin="anonymous"
    />
  )
}
