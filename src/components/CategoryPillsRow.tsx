"use client"

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CategoryPillsRowProps {
    category?: string
    subcategory?: string
    mainCategories: string[]
    activeSubcategories: string[]
}

export default function CategoryPillsRow({ category, subcategory, mainCategories, activeSubcategories }: CategoryPillsRowProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            // Use a 2px buffer to account for rounding scaling issues
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2)
        }
    }

    // Check scroll initially and on dependencies changes/resize
    useEffect(() => {
        checkScroll()
        // Minor delay to ensure items are fully rendered before calculating width
        const timeout = setTimeout(checkScroll, 100)
        window.addEventListener('resize', checkScroll)
        return () => {
            clearTimeout(timeout)
            window.removeEventListener('resize', checkScroll)
        }
    }, [category, subcategory, mainCategories, activeSubcategories])

    const scrollByAmount = (amount: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' })
            // Delay recalculation to allow smooth scroll to finish
            setTimeout(checkScroll, 350)
        }
    }

    return (
        <div className="w-full border-y border-foreground/10 bg-muted/20 sticky top-16 z-40 flex flex-col items-center">
            <div className="relative w-full max-w-7xl flex items-center">

                {/* Left Arrow Gradient Overlay */}
                {canScrollLeft && (
                    <div className="absolute left-0 z-20 h-full flex items-center pr-6 pl-2 md:pl-0 bg-gradient-to-r from-background via-background/80 to-transparent">
                        <button
                            onClick={() => scrollByAmount(-300)}
                            className="p-1.5 md:p-2 bg-background border border-border shadow-md rounded-full text-foreground hover:bg-muted transition-colors opacity-90 hover:opacity-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label="Scroll left"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    </div>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="w-full px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar items-center justify-start scroll-smooth relative"
                >
                    {/* Main Categories Menu */}
                    {!category ? (
                        <>
                            <Link href="/" className="whitespace-nowrap shrink-0">
                                <Button variant="default" className="rounded-full px-6 shadow-sm">All Prompts</Button>
                            </Link>
                            {mainCategories.map((cat) => (
                                <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`} className="whitespace-nowrap shrink-0">
                                    <Button variant="outline" className="rounded-full px-6 bg-background">
                                        {cat}
                                    </Button>
                                </Link>
                            ))}
                        </>
                    ) : (
                        /* Subcategories Menu */
                        <>
                            <Link href="/" className="whitespace-nowrap shrink-0">
                                <Button variant="ghost" className="rounded-full px-4 text-muted-foreground hover:text-foreground">
                                    <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    All Categories
                                </Button>
                            </Link>

                            <div className="w-px h-6 bg-border/50 mx-1 shrink-0" />

                            <Link href={`/?category=${encodeURIComponent(category || '')}`} className="whitespace-nowrap shrink-0">
                                <Button variant={!subcategory ? "default" : "outline"} className={`rounded-full px-5 ${subcategory ? 'bg-background' : ''}`}>
                                    All {category}
                                </Button>
                            </Link>

                            {activeSubcategories.map((sub) => (
                                <Link key={sub} href={`/?category=${encodeURIComponent(category || '')}&subcategory=${encodeURIComponent(sub)}`} className="whitespace-nowrap shrink-0">
                                    <Button variant={subcategory === sub ? "default" : "outline"} className={`rounded-full px-5 ${subcategory !== sub ? 'bg-background' : ''}`}>
                                        {sub}
                                    </Button>
                                </Link>
                            ))}
                        </>
                    )}
                </div>

                {/* Right Arrow Gradient Overlay */}
                {canScrollRight && (
                    <div className="absolute right-0 z-20 h-full flex items-center pl-6 pr-2 md:pr-0 bg-gradient-to-l from-background via-background/80 to-transparent">
                        <button
                            onClick={() => scrollByAmount(300)}
                            className="p-1.5 md:p-2 bg-background border border-border shadow-md rounded-full text-foreground hover:bg-muted transition-colors opacity-90 hover:opacity-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label="Scroll right"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}
