import { resetPassword } from '@/app/actions/reset'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const resolvedParams = await searchParams
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
            <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground" action={resetPassword}>
                <div className="flex flex-col space-y-2 text-center mb-4">
                    <h1 className="text-2xl font-semibold text-destructive tracking-tight">Security Required</h1>
                    <p className="text-sm text-muted-foreground">
                        You must change your default password before you can proceed.
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input type="password" name="password" placeholder="••••••••" required />
                    </div>
                    <Button className="w-full">Update Password</Button>
                    {resolvedParams?.message && (
                        <p className="mt-4 p-4 bg-destructive/10 text-destructive text-center text-sm rounded-md">
                            {resolvedParams.message}
                        </p>
                    )}
                </div>
            </form>
        </div>
    )
}
