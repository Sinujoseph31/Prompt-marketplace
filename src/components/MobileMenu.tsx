'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, ScanSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileMenuProps {
    isLoggedIn: boolean
    isAdmin: boolean
    signoutAction: any
}

export default function MobileMenu({ isLoggedIn, isAdmin, signoutAction }: MobileMenuProps) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    const close = () => setOpen(false)

    const overlay = open ? (
        <>
            {/* Backdrop — click anywhere to close */}
            <div
                className="fixed inset-0 z-[9998]"
                style={{ top: '64px', background: 'rgba(0,0,0,0.4)' }}
                onClick={close}
            />

            {/* Menu panel */}
            <div
                className="fixed left-0 right-0 z-[9999] bg-white shadow-xl"
                style={{ top: '64px', bottom: 0, overflowY: 'auto' }}
            >
                <nav className="flex flex-col p-5 gap-1 text-base font-medium text-black">

                    {/* Arena — same trophy SVG as desktop */}
                    <Link href="/arena" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors">
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

                    <p className="text-xs uppercase font-bold tracking-wider text-gray-400 px-4 pt-4 pb-1">AI Tools</p>

                    <Link href="/ai-tools/image-to-prompt" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-black">
                        🖼️ Image to Prompt
                    </Link>

                    {/* Reverse Engineer — same ScanSearch icon as desktop */}
                    <Link href="/ai-tools/reverse-engineer" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <ScanSearch className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-600">Reverse Engineer</span>
                    </Link>

                    <Link href="/ai-tools/roast-my-prompt" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-black">
                        🔥 Roast My Prompt
                    </Link>
                    <Link href="/ai-tools/vibe-check" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-black">
                        ✨ Vibe Check
                    </Link>
                    <Link href="/ai-tools/meme-architect" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-black">
                        😂 Meme Architect
                    </Link>
                    <Link href="/ai-tools/chaos-generator" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-black">
                        🌀 Chaos Generator
                    </Link>

                    <div className="border-t border-gray-200 my-3" />

                    {isAdmin && (
                        <Link href="/admin" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-blue-600">
                            ⚙️ Admin Panel
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <>
                            <Link href="/submit" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-black">
                                ➕ Create Prompt
                            </Link>
                            <form action={signoutAction} className="w-full">
                                <button type="submit" onClick={close} className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-gray-500">
                                    🚪 Log Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 mt-2 px-4">
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
        </>
    ) : null

    return (
        <div className="flex md:hidden shrink-0">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(o => !o)}
                aria-label="Open menu"
                className="shrink-0"
            >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {mounted && createPortal(overlay, document.body)}
        </div>
    )
}
