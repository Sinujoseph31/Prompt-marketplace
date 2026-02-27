'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export default function PromptCard({ prompt, forceAspectSquare = false }: { prompt: any, forceAspectSquare?: boolean }) {
    const router = useRouter()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

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
            className="group flex flex-col gap-3 cursor-pointer"
        >
            {/* Dynamic height or fixed square image container */}
            <div className={`w-full relative rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 z-0 group-hover:z-10 group bg-muted border border-border/50 overflow-hidden ${forceAspectSquare ? 'aspect-square' : ''}`}>

                {prompt.preview_images?.[0] || prompt.preview_image || prompt.preview_video ? (
                    !prompt.preview_video ? (
                        <img
                            src={prompt.preview_images?.[0] || prompt.preview_image}
                            alt={prompt.title}
                            className={`w-full object-cover transition-all duration-500 group-hover:scale-105 block ${forceAspectSquare ? 'h-full absolute inset-0' : 'h-auto aspect-square'}`}
                            style={{ aspectRatio: forceAspectSquare ? undefined : '1/1' }}
                        />
                    ) : (
                        <video
                            src={prompt.preview_video}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className={`w-full bg-black object-contain transition-all duration-500 group-hover:scale-105 block ${forceAspectSquare ? 'h-full absolute inset-0' : 'h-auto aspect-square'}`}
                            style={{ aspectRatio: forceAspectSquare ? undefined : '1/1' }}
                        />
                    )
                ) : (
                    <div className={`w-full flex items-center justify-center text-muted-foreground bg-muted/50 ${forceAspectSquare ? 'h-full absolute inset-0' : 'aspect-square'}`}>
                        No Image
                    </div>
                )}

                {/* Badge Container (Always on top of base image) */}
                <div className="absolute bottom-2 left-2 z-10 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none flex flex-col gap-1 items-start">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-xs font-semibold shadow-sm">
                        {prompt.category || 'Models'}
                    </Badge>
                    {prompt.subcategory && (
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-[10px] shadow-sm">
                            {prompt.subcategory}
                        </Badge>
                    )}
                </div>

                {/* Pop-up Hover Gallery (Visible only on desktop hover if multiple images and no video) */}
                {!prompt.preview_video && prompt.preview_images && prompt.preview_images.length > 1 && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl overflow-hidden bg-black pointer-events-none group-hover:pointer-events-auto shadow-2xl border border-primary/20 scale-100 group-hover:scale-[1.03] z-20 hidden md:flex flex-col">

                        <div
                            ref={scrollContainerRef}
                            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
                        >
                            {prompt.preview_images.map((imgUrl: string, idx: number) => (
                                <div key={idx} className="w-full h-full shrink-0 snap-center relative flex items-center justify-center bg-black/50">
                                    <img
                                        src={imgUrl}
                                        alt={`${prompt.title} preview ${idx + 1}`}
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows for the gallery */}
                        <button
                            onClick={scrollLeft}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={scrollRight}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Scroll hint pill at the top right */}
                        <div className="absolute top-2 right-2 flex justify-center pointer-events-none z-30">
                            <div className="bg-black/60 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                                {prompt.preview_images.length} Images
                            </div>
                        </div>

                        {/* Re-add badge to the overlay so it stays visible */}
                        <div className="absolute bottom-2 left-2 pointer-events-none z-30 flex flex-col gap-1 items-start">
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
                )}
            </div>

            {/* Compact Footer */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:underline decoration-foreground/30 underline-offset-4">{prompt.title}</h3>
                    <span className="font-bold text-base shrink-0">
                        {prompt.price ? `$${prompt.price}` : 'Free'}
                    </span>
                </div>
                {prompt.profiles?.name && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        By {prompt.profiles.name}
                    </p>
                )}
            </div>
        </div>
    )
}
