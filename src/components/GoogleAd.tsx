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
        let isMounted = true;
        let observer: ResizeObserver | null = null;
        let adPushed = false;

        const initAd = () => {
            try {
                if (isMounted && adRef.current && !adPushed) {
                    // AdSense crashes if it tries to render in a 0-width container
                    if (adRef.current.clientWidth > 0) {
                        // Prevent pushing to an already populated ad slot
                        if (adRef.current.innerHTML === '') {
                            // @ts-ignore
                            (window.adsbygoogle = window.adsbygoogle || []).push({})
                            adPushed = true;
                        }
                    }
                }
            } catch (error: any) {
                // Ignore the known "All 'ins' elements... have ads in them" error
                if (!error.message?.includes('already have ads')) {
                    console.error('Google Adsense Error:', error)
                }
            }
        }

        // Wait for the container to actually have layout width before injecting
        if (adRef.current) {
            observer = new ResizeObserver(() => {
                if (!adPushed) initAd();
            });
            observer.observe(adRef.current);
        }

        return () => {
            isMounted = false;
            if (observer) observer.disconnect();
        }
    }, [])

    // If no client ID exists (e.g., local dev without env vars), we show a placeholder for testing
    if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className={`w-full h-[100px] bg-muted border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground font-semibold text-sm animate-pulse ${className}`}>
                    [Ad Placeholder] <br /> Add NEXT_PUBLIC_GOOGLE_ADSENSE_ID to .env.local
                </div>
            )
        }
        return null;
    }

    // Google AdSense requires the slot to be a completely numeric ID (e.g. "1234567890").
    // If a descriptive string is passed, Google returns a 400 Bad Request.
    // We catch that here and intentionally render a developer hint.
    const isNumericSlot = /^\d+$/.test(slot);
    if (!isNumericSlot) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className={`w-full h-[100px] bg-muted/50 border border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground text-xs p-4 text-center ${className}`}>
                    <p className="font-bold text-sm text-foreground mb-1">Ad Slot: {slot}</p>
                    <p>Replace this string with your numeric Ad Unit ID from AdSense</p>
                </div>
            )
        }
        return null;
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
