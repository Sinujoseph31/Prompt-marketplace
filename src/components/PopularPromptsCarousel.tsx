'use client'

import { useRef, useState, useEffect } from 'react'
import PromptCard from '@/components/PromptCard'

export default function PopularPromptsCarousel({ title = "Popular Prompts", prompts }: { title?: string, prompts: any[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [prompts])

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
        }
    }

    if (!prompts || prompts.length === 0) return null

    return (
        <section className="w-full max-w-7xl mx-auto px-5 pb-4 md:pb-8 flex flex-col gap-3 md:gap-4 relative">
            <h2 className="text-2xl font-bold tracking-tight px-1">{title}</h2>

            <div className="relative group">
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="flex overflow-x-auto gap-3 md:gap-6 pb-2 md:pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 pt-1"
                >
                    {prompts.map((prompt) => (
                        <div key={prompt.id} className="w-[75vw] sm:w-64 md:w-72 lg:w-[calc((100%-4rem)/5)] shrink-0 snap-start">
                            <PromptCard prompt={prompt} forceAspectSquare={true} />
                        </div>
                    ))}
                </div>

                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-10 bg-background/90 text-foreground border border-border shadow-lg hover:bg-muted w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Scroll left"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-10 bg-background/90 text-foreground border border-border shadow-lg hover:bg-muted w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Scroll right"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                )}
            </div>
        </section>
    )
}
