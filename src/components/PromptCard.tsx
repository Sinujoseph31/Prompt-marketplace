'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

export default function PromptCard({ prompt, forceAspectSquare = false }: { prompt: any, forceAspectSquare?: boolean }) {
    const router = useRouter()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    useEffect(() => {
        if (prompt.preview_images?.length > 1) {
            checkScroll()
            window.addEventListener('resize', checkScroll)
            return () => window.removeEventListener('resize', checkScroll)
        }
    }, [prompt.preview_images])

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
        }
    }

    let avgRating = 0
    let reviewCount = 0
    if (prompt.comments && Array.isArray(prompt.comments) && prompt.comments.length > 0) {
        reviewCount = prompt.comments.length
        avgRating = prompt.comments.reduce((acc: number, c: any) => acc + (c.rating || 5), 0) / reviewCount
    }

    const scrollLeft = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' })
        }
    }

    const scrollRight = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' })
        }
    }

    const handleCardClick = () => {
        router.push(`/prompt/${prompt.id}`)
    }

    return (
        <div
            onClick={handleCardClick}
            className="flex flex-col gap-3 cursor-pointer"
        >
            {/* Fixed aspect ratio container to keep grid perfectly aligned */}
            <div className={`w-full relative rounded-xl shadow-sm transition-all duration-300 z-0 bg-muted border border-border/50 overflow-hidden aspect-[4/5] group`}>

                {prompt.preview_images && prompt.preview_images.length > 0 ? (
                    <>
                        <div 
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
                        >
                            {prompt.preview_images.map((imgUrl: string, idx: number) => (
                                <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                                    <img
                                        src={imgUrl}
                                        alt={`${prompt.title} preview ${idx + 1}`}
                                        className="w-full h-full object-cover block"
                                    />
                                    {/* Individual Slide Counter */}
                                    {prompt.preview_images.length > 1 && (
                                        <div className="absolute top-2 right-2 flex justify-center z-20 pointer-events-none">
                                            <div className="bg-black/60 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                                                {idx + 1} / {prompt.preview_images.length}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows for the gallery (Desktop Hover) */}
                        {prompt.preview_images.length > 1 && (
                            <>
                                {canScrollLeft && (
                                    <button
                                        onClick={scrollLeft}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-30 hidden md:flex"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                )}
                                {canScrollRight && (
                                    <button
                                        onClick={scrollRight}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-30 hidden md:flex"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                )}
                            </>
                        )}
                    </>
                ) : prompt.preview_video ? (
                    <video
                        src={prompt.preview_video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover block"
                    />
                ) : prompt.preview_image ? (
                    <img
                        src={prompt.preview_image}
                        alt={prompt.title}
                        className="w-full h-full object-cover block"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                        No Image
                    </div>
                )}

                {/* Badge Container (Always on top of base image) */}
                <div className="absolute bottom-2 left-2 z-30 pointer-events-none flex flex-col gap-1 items-start">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-xs font-semibold shadow-sm">
                        {prompt.category || 'Models'}
                    </Badge>
                    {prompt.subcategory && (
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-[10px] shadow-sm">
                            {prompt.subcategory}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Compact Footer */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-start gap-1 pb-0.5">
                    <h3 className="font-semibold text-sm md:text-base leading-tight line-clamp-1 group-hover:underline decoration-foreground/30 underline-offset-4">{prompt.title}</h3>
                    <span className="font-bold text-sm md:text-base shrink-0 text-primary">
                        Free
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    {prompt.profiles?.name && (
                        <p className="text-[11px] md:text-sm text-muted-foreground line-clamp-1">
                            By {prompt.profiles.name}
                        </p>
                    )}
                    {reviewCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-foreground/80 shrink-0">
                            <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{avgRating.toFixed(1)}</span>
                            <span className="text-muted-foreground hidden sm:inline-block">({reviewCount})</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
