import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import CategoryDropdown from '@/components/CategoryDropdown'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AIToolsDropdown } from '@/components/navigation/ai-tools-dropdown'
import { ScanSearch } from 'lucide-react'
import MobileMenu from '@/components/MobileMenu'

export default async function Navbar() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
    }

    return (
        <nav 
            className="w-full border-b border-b-foreground/10 sticky top-0 bg-background/95 backdrop-blur z-[100]"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16 px-5">
                {/* Logo & Dropdown */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-bold text-lg md:text-xl flex items-center gap-2">
                        <Image src="/logo.png" alt="Prompt4life Logo" width={32} height={32} className="rounded-xl shadow-sm" priority />
                        <span className="tracking-tight hidden sm:inline-block">Prompt4life</span>
                        {profile?.role === 'admin' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm hidden sm:inline-block">Admin</span>
                        )}
                    </Link>
                    <CategoryDropdown />
                </div>

                {/* Centered Search Bar */}
                <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
                    <SearchBar />
                </div>

                {/* Right Actions - desktop only scrollable icon buttons */}
                <div className="flex items-center gap-2 shrink-0">

                    {/* Desktop-only nav links (hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-2">
                        <AIToolsDropdown />

                        <Link href="/ai-tools/reverse-engineer" className="inline-flex shrink-0">
                            <Button variant="ghost" size="sm" className="font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors gap-2 px-3">
                                <ScanSearch className="w-4 h-4" />
                                <span>Reverse Engineer</span>
                            </Button>
                        </Link>

                        <Link href="/arena" className="inline-flex shrink-0">
                            <Button variant="ghost" size="sm" className="font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 hover:bg-yellow-500/10 transition-colors gap-2 px-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                                <span>Arena</span>
                            </Button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2">
                                {profile?.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm">Admin</Button>
                                    </Link>
                                )}
                                <Link href="/submit">
                                    <Button className="rounded-full shadow-sm px-4" size="sm">Create Prompt</Button>
                                </Link>
                                <form action={signout} className="flex">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2" aria-label="Log out">
                                        Log out
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="px-3">Log in</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="rounded-full shadow-sm px-4">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Theme toggle always visible */}
                    <ThemeToggle />

                    {/* Mobile-only: Log in/Sign Up compact + Hamburger */}
                    <div className="flex md:hidden items-center gap-1">
                        {!user && (
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="px-2 text-sm">Log in</Button>
                            </Link>
                        )}
                        <MobileMenu
                            isLoggedIn={!!user}
                            isAdmin={profile?.role === 'admin'}
                            signoutAction={signout}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar - displayed below the top navbar icons */}
            <div className="md:hidden px-5 pb-3">
                <SearchBar />
            </div>
        </nav>
    )
}
