import Link from 'next/link'
import { login, sendMagicLink } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from '@/components/OAuthButtons'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const resolvedParams = await searchParams
    return (
        <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Futuristic ambient glow for background */}
            <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>
            
            <div className="w-full max-w-sm relative z-10">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
                            P4
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground">Prompt4life</span>
                    </Link>
                </div>

                <div className="bg-card text-card-foreground shadow-xl shadow-black/5 border border-border/50 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
                    <form className="flex-1 flex flex-col w-full justify-center gap-6" action={login}>
                        <div className="flex flex-col space-y-2 text-center mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">Login</h1>
                            <p className="text-sm text-muted-foreground">Welcome back to Prompt4life</p>
                        </div>

                        <OAuthButtons />

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-4 text-muted-foreground/70 font-semibold tracking-wider">Or continue via Email</span>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            <div className="grid gap-2 group">
                                <Label htmlFor="email" className="text-foreground/80 group-focus-within:text-primary transition-colors">Email Address</Label>
                                <Input 
                                    name="email" 
                                    placeholder="you@example.com" 
                                    required 
                                    className="bg-background border-border focus:border-primary h-12 transition-all"
                                />
                            </div>
                            <div className="grid gap-2 group">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-foreground/80 group-focus-within:text-primary transition-colors">Password</Label>
                                    <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input 
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    className="bg-background border-border focus:border-primary h-12 transition-all"
                                />
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-2">
                                <Button className="w-full h-12 text-md font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                    Login
                                </Button>
                                <Button formAction={sendMagicLink} variant="outline" type="submit" className="w-full h-12 bg-transparent border-border hover:bg-muted hover:text-foreground transition-colors">
                                    Email me a Magic Link
                                </Button>
                            </div>
                            
                            {resolvedParams?.message && (
                                <div className="mt-2 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-center text-sm font-medium backdrop-blur-sm">
                                    {resolvedParams.message}
                                </div>
                            )}
                        </div>

                        <div className="text-center text-sm mt-4 text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-primary font-medium hover:underline hover:underline-offset-4 transition-all">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
