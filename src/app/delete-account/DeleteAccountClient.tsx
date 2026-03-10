'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export default function DeleteAccountClient() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmText, setConfirmText] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setIsLoading(false)
        }
        fetchUser()
    }, [supabase])

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm.')
            return
        }

        setIsDeleting(true)
        setError(null)

        try {
            // Call the secure Postgres RPC function we created
            const { error: rpcError } = await supabase.rpc('delete_user')
            
            if (rpcError) throw rpcError

            // Sign the user out locally to clear their session cookies
            await supabase.auth.signOut()
            
            // Redirect to home page
            router.push('/?deleted=true')
            router.refresh()
            
        } catch (err: any) {
            console.error('Failed to delete account:', err)
            setError(err.message || 'An unexpected error occurred while deleting your account.')
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Checking account status...</div>
    }

    if (!user) {
        return (
            <div className="bg-muted rounded-lg p-5 flex flex-col items-center text-center mt-6">
                <p className="font-medium mb-4">You are not logged in.</p>
                <p className="text-sm text-muted-foreground mb-4">
                    To automatically delete your account, please log in first.
                    Alternatively, send an email to our support team:
                </p>
                <a 
                    href="mailto:support@prompt4life.com?subject=Account Deletion Request&body=Please delete my account and all associated data. My registered email address is: [Insert your email here]" 
                    className="text-lg font-bold text-primary hover:underline"
                >
                    support@prompt4life.com
                </a>
            </div>
        )
    }

    return (
        <div className="mt-8 pt-8 border-t border-destructive/20 border-dashed">
            <h3 className="text-xl font-bold text-destructive flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
                You are currently logged in as <strong>{user.email}</strong>. 
                Proceeding will instantly and permanently delete this account.
            </p>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="bg-card border rounded-lg p-4 max-w-sm mb-4">
                <label className="block text-sm font-medium mb-2">
                    Type <strong>DELETE</strong> to confirm:
                </label>
                <input 
                    type="text" 
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="DELETE"
                />
            </div>

            <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={isDeleting || confirmText !== 'DELETE'}
                className="gap-2"
            >
                {isDeleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                    <><Trash2 className="w-4 h-4" /> Delete My Account Permanently</>
                )}
            </Button>
        </div>
    )
}
