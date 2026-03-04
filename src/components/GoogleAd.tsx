'use client'

import { useEffect, useRef } from 'react'

interface GoogleAdProps {
    slot: string
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
    responsive?: boolean
    className?: string
}

export default function GoogleAd({
    slot,
    format = 'auto',
    responsive = true,
    className = ''
}: GoogleAdProps) {
    const adRef = useRef<HTMLModElement>(null)

    useEffect(() => {
        try {
            // Push the ad only if it hasn't been pushed yet (prevents dev double-render issues)
            if (adRef.current && !adRef.current.hasAttribute('data-ad-status')) {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({})
            }
        } catch (error) {
            console.error('Google Adsense Error:', error)
        }
    }, [])

    // If no client ID exists (e.g., local dev without env vars), we show a placeholder for testing
    if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
        return (
            <div className={`w-full h-[100px] bg-muted border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground font-semibold text-sm animate-pulse ${className}`}>
                [Ad Placeholder] <br /> Add NEXT_PUBLIC_GOOGLE_ADSENSE_ID to .env.local
            </div>
        )
    }

    return (
        <div className={`w-full overflow-hidden flex justify-center ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
        </div>
    )
}
