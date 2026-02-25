import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import CategoryDropdown from '@/components/CategoryDropdown'

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
        <nav className="w-full border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur z-50">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full px-5">
                {/* Logo & Dropdown */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <span className="tracking-tight">PromptWithSinu</span>
                        {profile?.role === 'admin' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">Admin</span>
                        )}
                    </Link>
                    <CategoryDropdown />
                </div>

                {/* Centered Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <SearchBar />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            {profile?.role === 'admin' && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Admin</Button>
                                </Link>
                            )}
                            <Link href="/submit">
                                <Button className="rounded-full shadow-sm" size="sm">Create Prompt</Button>
                            </Link>

                            <form action={signout}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log out</Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="rounded-full shadow-sm">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
