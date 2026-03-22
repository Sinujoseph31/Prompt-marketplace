import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SearchBar from '@/components/SearchBar'
import CategoryDropdown from '@/components/CategoryDropdown'
import { AIToolsDropdown } from '@/components/navigation/ai-tools-dropdown'
import { ScanSearch, PlusCircle, Settings, User as UserIcon, Shield, Store, Fingerprint } from 'lucide-react'
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
            className="fixed top-0 left-0 right-0 w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur z-[100]"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16 px-5">
                {/* Logo & Category Dropdown */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-bold text-lg md:text-xl flex items-center gap-2">
                        <Image src="/logo.png" alt="Prompt4life Logo" width={32} height={32} className="rounded-xl shadow-sm" priority />
                        <span className="tracking-tight hidden sm:inline-block">Prompt4life</span>
                        {profile?.role === 'admin' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm hidden sm:inline-block">Admin</span>
                        )}
                    </Link>
                    <div className="md:hidden">
                        <div className="flex items-center h-8 bg-muted/50 hover:bg-muted border rounded-md transition-colors">
                            <CategoryDropdown />
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <CategoryDropdown />
                    </div>
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

                        <Link href="/ai-tools/aesthetic-dna" className="inline-flex shrink-0">
                            <Button variant="ghost" size="sm" className="font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 hover:bg-blue-500/10 transition-colors gap-2 px-3">
                                <Fingerprint className="w-4 h-4" />
                                <span>Aesthetic DNA</span>
                            </Button>
                        </Link>

                        <Link href="/arena" className="inline-flex shrink-0">
                            <Button variant="ghost" size="sm" className="font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 hover:bg-yellow-500/10 transition-colors gap-2 px-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                                <span>Arena</span>
                            </Button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-1 md:gap-2 mr-2">
                                {profile?.role === 'admin' && (
                                    <div className="relative group flex items-center">
                                        <Link href="/admin">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/5 hover:bg-primary/15 transition-colors">
                                                <Shield className="h-4 w-4 text-primary" />
                                            </Button>
                                        </Link>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded shadow-sm pointer-events-none whitespace-nowrap z-50">
                                            Admin Panel
                                        </span>
                                    </div>
                                )}
                                {(profile?.role === 'admin' || (profile?.role === 'seller' && profile?.approved)) && (
                                    <div className="relative group flex items-center">
                                        <Link href="/submit">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                                <PlusCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </Button>
                                        </Link>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded shadow-sm pointer-events-none whitespace-nowrap z-50">
                                            Create Prompt
                                        </span>
                                    </div>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <Image 
                                                    src={profile.avatar_url} 
                                                    alt="Avatar" 
                                                    fill
                                                    className="object-cover border border-border"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-muted flex items-center justify-center border border-border">
                                                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <div className="flex flex-col space-y-1 p-2">
                                            <p className="text-sm font-medium leading-none">{profile?.name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center cursor-pointer w-full">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/user/${user?.id}`} className="flex items-center cursor-pointer w-full">
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>My Storefront</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <form action={signout} className="w-full">
                                                <button type="submit" className="w-full text-left cursor-pointer flex items-center">
                                                    Log out
                                                </button>
                                            </form>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

                    {/* Mobile-only: Log in/Sign Up compact + Hamburger */}
                    <div className="flex md:hidden items-center gap-1">
                        {user ? (
                            <>
                                {profile?.role === 'admin' && (
                                    <div className="relative group">
                                        <Link href="/admin">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/15 transition-colors">
                                                <Shield className="h-4 w-4 text-primary" />
                                            </Button>
                                        </Link>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded shadow-sm pointer-events-none whitespace-nowrap z-50">
                                            Admin Panel
                                        </span>
                                    </div>
                                )}
                                {(profile?.role === 'admin' || (profile?.role === 'seller' && profile?.approved)) && (
                                    <div className="relative group">
                                        <Link href="/submit">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                                <PlusCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </Button>
                                        </Link>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded shadow-sm pointer-events-none whitespace-nowrap z-50">
                                            Create Prompt
                                        </span>
                                    </div>
                                )}
                                <div className="relative group">
                                    <Link href={`/user/${user.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
                                            <Store className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </Button>
                                    </Link>
                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded shadow-sm pointer-events-none whitespace-nowrap z-50">
                                        My Storefront
                                    </span>
                                </div>
                                <Link href="/profile" className="mx-1" title="Profile Settings">
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <Image 
                                                src={profile.avatar_url} 
                                                alt="Avatar" 
                                                fill
                                                className="object-cover border border-border"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center border border-border">
                                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="px-2 text-sm">Log in</Button>
                            </Link>
                        )}
                        <MobileMenu
                            isLoggedIn={!!user}
                            isAdmin={profile?.role === 'admin'}
                            userId={user?.id}
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
