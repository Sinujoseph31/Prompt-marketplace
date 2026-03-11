import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClientForm from './ProfileClientForm'

export const metadata = {
    title: 'Profile Settings | Prompt Marketplace',
}

export default async function ProfilePage() {
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Fetch User Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/')
    }

    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Update your public profile information and avatar. This is how other users will see you on the marketplace.
                    </p>
                </div>
                
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <ProfileClientForm profile={profile} />
                </div>
            </div>
        </main>
    )
}
