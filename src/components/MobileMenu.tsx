'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, ScanSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileMenuProps {
    isLoggedIn: boolean
    isAdmin: boolean
    userId?: string
    signoutAction: any
}

export default function MobileMenu({ isLoggedIn, isAdmin, userId, signoutAction }: MobileMenuProps) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    const close = () => setOpen(false)

    const overlay = open ? (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop — click anywhere to close */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={close}
            />

            {/* Sliding Drawer Panel */}
            <div
                className="relative w-[85vw] max-w-sm h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            >
                {/* Header (adjusted for mobile notch/status bar) */}
                <div 
                    className="flex items-center justify-between px-5 pb-4 border-b border-border"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
                >
                    <span className="font-bold tracking-tight text-lg">Menu</span>
                    <Button variant="ghost" size="icon" onClick={close} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-6">
                    <nav className="flex flex-col gap-1 text-base font-medium">
                        <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground px-2 pb-2">Navigation</p>

                        <Link href="/search" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            🔍 Browse Prompts
                        </Link>

                        {/* Arena */}
                        <Link href="/arena" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                <path d="M4 22h16" />
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                            </svg>
                            <span className="font-bold text-yellow-600">Arena</span>
                        </Link>

                        <div className="border-t border-border my-2" />

                        <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground px-2 pt-2 pb-2">AI Tools</p>

                        <Link href="/ai-tools/image-to-prompt" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            🖼️ Image to Prompt
                        </Link>
                        <Link href="/ai-tools/reverse-engineer" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            <ScanSearch className="w-5 h-5 text-emerald-600" />
                            <span className="font-bold text-emerald-600">Reverse Engineer</span>
                        </Link>
                        <Link href="/ai-tools/roast-my-prompt" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            🔥 Roast My Prompt
                        </Link>
                        <Link href="/ai-tools/vibe-check" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            ✨ Vibe Check
                        </Link>
                        <Link href="/ai-tools/meme-architect" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            😂 Meme Architect
                        </Link>
                        <Link href="/ai-tools/chaos-generator" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                            🌀 Chaos Generator
                        </Link>

                        <div className="border-t border-border my-2" />

                        {isAdmin && (
                            <Link href="/admin" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors font-semibold text-primary">
                                ⚙️ Admin Panel
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <>
                                <Link href="/submit" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                                    ➕ Create Prompt
                                </Link>
                                <Link href="/profile" onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                                    ⚙️ Settings
                                </Link>
                                {userId && (
                                    <Link href={`/user/${userId}`} onClick={close} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors">
                                        🏪 My Storefront
                                    </Link>
                                )}
                                <form action={signoutAction} className="w-full">
                                    <button type="submit" className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted transition-colors w-full text-left text-muted-foreground">
                                        🚪 Log Out
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 mt-4">
                                <Link href="/login" onClick={close}>
                                    <Button variant="outline" className="w-full rounded-full">Log In</Button>
                                </Link>
                                <Link href="/signup" onClick={close}>
                                    <Button className="w-full rounded-full">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    ) : null

    return (
        <div className="flex md:hidden shrink-0">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(o => !o)}
                aria-label="Open menu"
                className="shrink-0"
            >
                <Menu className="w-6 h-6" />
            </Button>

            {mounted && createPortal(overlay, document.body)}
        </div>
    )
}
