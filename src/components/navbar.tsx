import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import CategoryDropdown from '@/components/CategoryDropdown'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AIToolsDropdown } from '@/components/navigation/ai-tools-dropdown'
import { ScanSearch } from 'lucide-react'

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
        <nav className="w-full border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur z-[100]">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full px-5">
                {/* Logo & Dropdown */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-bold text-lg md:text-xl flex items-center gap-2">
                        <span className="tracking-tight">PromptWithSinu</span>
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

                {/* Right Actions */}
                <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                    <AIToolsDropdown />

                    <Link href="/ai-tools/reverse-engineer" className="inline-flex">
                        <Button variant="ghost" size="sm" className="font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors gap-1 sm:gap-2 px-2 sm:px-3">
                            <ScanSearch className="w-4 h-4" />
                            <span className="hidden md:inline">Reverse Engineer</span>
                        </Button>
                    </Link>

                    <Link href="/arena" className="inline-flex">
                        <Button variant="ghost" size="sm" className="font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 hover:bg-yellow-500/10 transition-colors gap-1 sm:gap-2 px-2 sm:px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                            <span className="hidden md:inline">Arena</span>
                        </Button>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            {profile?.role === 'admin' && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Admin</Button>
                                </Link>
                            )}

                            <Link href="/submit">
                                <Button className="rounded-full shadow-sm px-3 md:px-4 flex items-center gap-1" size="sm">
                                    <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span className="hidden md:inline">Create Prompt</span>
                                </Button>
                            </Link>

                            <form action={signout}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2" aria-label="Log out">
                                    <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    <span className="hidden md:inline">Log out</span>
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="px-2 sm:px-3">Log in</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="rounded-full shadow-sm px-3 sm:px-4">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </nav >
    )
}
