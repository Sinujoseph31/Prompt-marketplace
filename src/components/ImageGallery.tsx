'use client'

import { useState } from 'react'

export default function ImageGallery({ images, title }: { images: string[], title: string }) {
    const [activeIndex, setActiveIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[4/3] md:aspect-[16/10] bg-muted rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground">
                No preview image available
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Hero Image(s) - Horizontally scrollable on mobile, single active image on desktop */}
            <div className="w-full bg-muted rounded-xl overflow-x-auto snap-x snap-mandatory flex [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border border-border/50 relative">
                {images.map((imgUrl, idx) => (
                    <img
                        key={idx}
                        src={imgUrl}
                        alt={`${title} - Preview ${idx + 1}`}
                        className={`w-full h-auto max-h-[85vh] object-cover shrink-0 snap-center transition-opacity duration-300 ${activeIndex === idx ? 'block' : 'block md:hidden'}`}
                    />
                ))}

                {/* Mobile scroll indicator */}
                {images.length > 1 && (
                    <div className="md:hidden absolute bottom-4 right-4 bg-black/60 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-sm pointer-events-none z-10 sticky left-full">
                        {images.length} Images
                    </div>
                )}
            </div>

            {/* Thumbnails Row (Hidden on mobile) */}
            {images.length > 1 && (
                <div className="hidden md:flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {images.map((imgUrl, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative w-24 h-24 md:w-32 md:h-32 shrink-0 snap-start bg-muted rounded-lg overflow-hidden border-2 transition-all ${activeIndex === idx
                                ? 'border-primary opacity-100 ring-2 ring-primary ring-offset-1'
                                : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={imgUrl}
                                alt={`${title} thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
