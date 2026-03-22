import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PromptCard from '@/components/PromptCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { deleteUserPrompt } from '@/app/actions/prompts'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', id)
        .single()
        
    return {
        title: `${profile?.name || 'User'} | Prompt Marketplace`
    }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Target User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!profile) notFound()

    // 2. Identify Logged-In User Privilege
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    let isOwner = false
    let isAdmin = false

    if (currentUser) {
        if (currentUser.id === id) isOwner = true
        
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()
            
        if (currentProfile?.role === 'admin') isAdmin = true
    }

    const hasFullAccess = isOwner || isAdmin

    // 3. Fetch Prompts
    let query = supabase
        .from('prompts')
        .select(`
            *,
            profiles:seller_id (id, name, avatar_url)
        `)
        .eq('seller_id', id)
        .order('created_at', { ascending: false })

    if (!hasFullAccess) {
        // General Public only sees approved prompts
        query = query.eq('status', 'approved')
    }

    const { data: rawPrompts } = await query
    const prompts = rawPrompts || []

    const approvedPrompts = prompts.filter(p => p.status === 'approved')
    const pendingPrompts = prompts.filter(p => p.status === 'pending')
    const rejectedPrompts = prompts.filter(p => p.status === 'rejected')

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 bg-card rounded-2xl p-8 border shadow-sm">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-md bg-muted flex items-center justify-center">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                         <div className="text-4xl text-muted-foreground">{profile.name?.charAt(0) || 'U'}</div>
                    )}
                </div>
                <div className="text-center md:text-left space-y-2 flex-1 pt-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.name || 'Anonymous User'}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        {profile.role === 'admin' && (
                            <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Admin</span>
                        )}
                        {(profile.role === 'seller' && profile.approved) && (
                            <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Verified Seller</span>
                        )}
                    </div>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mt-4 whitespace-pre-wrap leading-relaxed">
                        {profile.bio || "This user hasn't added a bio yet."}
                    </p>
                </div>
            </div>

            {hasFullAccess ? (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Manage Your Prompts</h2>
                        <Link href="/submit">
                            <Button className="flex items-center gap-2 shadow-sm rounded-full"><PlusCircle className="w-4 h-4" /> Add New Prompt</Button>
                        </Link>
                    </div>

                    <Tabs defaultValue="approved" className="w-full">
                    <TabsList className="mb-8 bg-muted/50 p-1 w-full sm:w-auto h-auto flex flex-wrap sm:inline-flex">
                        <TabsTrigger value="approved" className="flex-1 sm:flex-none">Approved ({approvedPrompts.length})</TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1 sm:flex-none text-yellow-600 data-[state=active]:text-yellow-700">Pending ({pendingPrompts.length})</TabsTrigger>
                        <TabsTrigger value="rejected" className="flex-1 sm:flex-none text-red-600 data-[state=active]:text-red-700">Rejected ({rejectedPrompts.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="approved">
                        <PromptGrid prompts={approvedPrompts} emptyMessage="No approved prompts yet." isEditable={true} />
                    </TabsContent>
                    <TabsContent value="pending">
                        <PromptGrid prompts={pendingPrompts} emptyMessage="No pending prompts." isEditable={true} />
                    </TabsContent>
                    <TabsContent value="rejected">
                        <PromptGrid prompts={rejectedPrompts} emptyMessage="No rejected prompts." isEditable={true} />
                    </TabsContent>
                </Tabs>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight border-b pb-4">Portfolio</h2>
                    <PromptGrid prompts={approvedPrompts} emptyMessage="This user hasn't published any prompts yet." />
                </div>
            )}
        </main>
    )
}

function PromptGrid({ prompts, emptyMessage, isEditable }: { prompts: any[], emptyMessage: string, isEditable?: boolean }) {
    if (prompts.length === 0) {
        return (
            <div className="text-center py-24 bg-muted/10 border-2 border-dashed rounded-xl">
                <p className="text-lg text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prompts.map(prompt => (
                <div key={prompt.id} className="flex flex-col gap-2">
                    <PromptCard prompt={prompt} />
                    {isEditable && (
                        <div className="flex items-center gap-2 w-full pt-1">
                            <Link href={`/edit/${prompt.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Edit</Button>
                            </Link>
                            <form action={deleteUserPrompt.bind(null, prompt.id)} className="flex-1">
                                <Button variant="destructive" size="sm" className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700"><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                            </form>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
