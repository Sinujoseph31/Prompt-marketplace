import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const resolvedParams = await searchParams
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
            <Link
                href="/"
                className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{' '}
                Back
            </Link>

            <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground" action={login}>
                <div className="flex flex-col space-y-2 text-center mb-4">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" placeholder="you@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" name="password" placeholder="••••••••" required />
                    </div>
                    <Button className="w-full">Sign In</Button>
                    {resolvedParams?.message && (
                        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center text-sm">
                            {resolvedParams.message}
                        </p>
                    )}
                </div>

                <div className="text-center text-sm mt-4">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    )
}
