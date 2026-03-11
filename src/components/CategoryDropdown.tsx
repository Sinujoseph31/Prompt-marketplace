'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const CATEGORIES: Record<string, { label: string, items: string[] }> = {
    'Models': {
        label: 'Models',
        items: ['ChatGPT Prompts', 'Claude Prompts', 'Gemini Prompts', 'DeepSeek Prompts', 'MidJourney Prompts', 'DALL‑E Prompts', 'Stable Diffusion Prompts', 'Other AI Models']
    },
    'Art & Illustrations': {
        label: 'Art & Illustrations',
        items: ['Drawing & Sketches', 'Cartoons & Comics', 'Painting Styles (gouache, pop art, surrealism)', 'Character & Portrait Art', 'Fantasy & Surrealism', 'Decorative Art (coloring books, posters, stickers)', 'Experimental & Mixed Media']
    },
    'Logos & Icons': {
        label: 'Logos & Icons',
        items: ['All']
    },
    'Graphics & Design': {
        label: 'Graphics & Design',
        items: ['Posters & Flyers', 'Infographics', 'UI/UX Elements', 'Profile Picture']
    },
    'Productivity & Writing': {
        label: 'Productivity & Writing',
        items: ['Copywriting Prompts', 'Blog/Article Generation', 'Email Templates', 'Task Management & Workflow Prompts']
    },
    'Marketing & Business': {
        label: 'Marketing & Business',
        items: ['Social Media Content', 'Ad Copy Generation', 'Branding Concepts', 'Business Pitch Decks']
    },
    'Photography': {
        label: 'Photography',
        items: ['Portrait Styles', 'Landscape Prompts', 'Product Photography', 'Cinematic Photography']
    },
    'Games & 3D': {
        label: 'Games & 3D',
        items: ['Character Models', 'Environment/World Design', 'Game Asset Packs', '3D Object Rendering']
    }
}

export default function CategoryDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string>('Models')
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 150)
    }

    // Handle clicking outside to close on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('touchstart', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div
            className="relative z-50 ml-0 md:ml-2 h-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button variant="ghost" className="flex items-center h-full gap-1 font-medium text-muted-foreground hover:text-foreground px-2 py-0 md:px-4 md:py-2">
                <span className="hidden sm:inline">Categories</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </Button>

            {isOpen && (
                <div ref={dropdownRef} className="fixed top-[64px] left-4 right-4 md:absolute md:top-full md:left-0 md:right-auto mt-2 md:w-[650px] md:max-w-[650px] z-50 bg-background border rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-top-2 duration-200 select-none">
                    {/* Left Sidebar: Main Categories */}
                    <div className="w-full md:w-2/5 bg-muted/30 border-b md:border-b-0 md:border-r p-2 flex flex-col gap-1 max-h-[40vh] md:max-h-none overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Categories
                        </div>
                        {Object.keys(CATEGORIES).map((cat) => (
                            <div
                                key={cat}
                                onMouseEnter={() => setActiveCategory(cat)}
                                className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${activeCategory === cat
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-muted text-foreground/80 hover:text-foreground'
                                    }`}
                            >
                                {CATEGORIES[cat].label}
                            </div>
                        ))}
                    </div>

                    {/* Right Content: Subcategories */}
                    <div className="w-full md:w-3/5 p-4 flex flex-col bg-background max-h-[50vh] md:max-h-none overflow-y-auto">
                        <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <h3 className="font-semibold text-foreground">
                                {CATEGORIES[activeCategory].label}
                            </h3>
                            <Link
                                href={`/search?category=${encodeURIComponent(activeCategory)}`}
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-primary hover:underline"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="flex flex-col gap-1">
                            {CATEGORIES[activeCategory].items.map((sub) => (
                                <Link
                                    key={sub}
                                    href={`/search?category=${encodeURIComponent(activeCategory)}&subcategory=${encodeURIComponent(sub)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                                >
                                    {sub}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
