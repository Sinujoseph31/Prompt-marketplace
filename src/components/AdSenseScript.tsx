'use client'

import Script from 'next/script'

export default function AdSenseScript() {
  if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
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
