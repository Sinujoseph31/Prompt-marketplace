'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ images, video, title }: { images: string[], video?: string | null, title: string }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const scrollAmount = container.clientWidth
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
        }
    }

    const mediaList = []
    if (video) {
        mediaList.push({ type: 'video', url: video })
    }
    if (images && images.length > 0) {
        images.forEach(imgUrl => mediaList.push({ type: 'image', url: imgUrl }))
    }

    if (mediaList.length === 0) {
        return (
            <div className="w-full aspect-[4/3] md:aspect-[16/10] bg-muted rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground">
                No preview media available
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Hero Media - Horizontally scrollable on mobile, single active item on desktop */}
            <div className="relative w-full flex justify-center group">
                {mediaList.length > 1 && (
                    <button onClick={() => scroll('left')} className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm shadow-md">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                <div ref={scrollContainerRef} className="w-full md:w-fit max-w-full rounded-xl overflow-x-auto snap-x snap-mandatory flex [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border border-border/50 shadow-sm relative bg-muted/20 md:bg-transparent">
                    {mediaList.map((media, idx) => (
                        <div key={idx} className={`w-full md:w-fit shrink-0 snap-center transition-opacity duration-300 flex items-center justify-center bg-black/5 dark:bg-black/20 md:bg-transparent ${activeIndex === idx ? 'block' : 'block md:hidden'}`}>
                            {media.type === 'video' ? (
                                <video
                                    src={media.url}
                                    controls
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full md:w-auto aspect-square md:aspect-auto h-auto md:max-h-[75vh] object-contain rounded-xl bg-black"
                                />
                            ) : (
                                <img
                                    src={media.url}
                                    alt={`${title} - Preview ${idx + 1}`}
                                    className="w-full md:w-auto aspect-square md:aspect-auto h-auto md:max-h-[80vh] object-cover md:object-contain rounded-xl"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {mediaList.length > 1 && (
                    <button onClick={() => scroll('right')} className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm shadow-md animate-pulse">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Mobile scroll indicator */}
                {mediaList.length > 1 && (
                    <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm pointer-events-none z-10 whitespace-nowrap">
                        Swipe ({mediaList.length} Media)
                    </div>
                )}
            </div>

            {/* Thumbnails Row (Hidden on mobile) */}
            {mediaList.length > 1 && (
                <div className="hidden md:flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {mediaList.map((media, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative w-24 h-24 md:w-32 md:h-32 shrink-0 snap-start bg-muted rounded-lg overflow-hidden border-2 transition-all ${activeIndex === idx
                                ? 'border-primary opacity-100 ring-2 ring-primary ring-offset-2'
                                : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            {media.type === 'video' ? (
                                <>
                                    <video src={media.url} className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white pointer-events-none">
                                        <svg className="w-10 h-10 opacity-90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={media.url}
                                    alt={`${title} thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
