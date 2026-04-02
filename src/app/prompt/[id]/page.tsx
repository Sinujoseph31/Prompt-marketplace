import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import RevealPrompt from '@/components/RevealPrompt'
import ImageGallery from '@/components/ImageGallery'
import PromptCard from '@/components/PromptCard'
import Comments from '@/components/Comments'
import GoogleAd from '@/components/GoogleAd'

export default async function PromptDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params
    const id = resolvedParams.id
    const supabase = await createClient()

    const { data: prompt } = await supabase
        .from('prompts')
        .select('*, profiles(name)')
        .eq('id', id)
        .single()

    // Fetch similar prompts in the same category
    const { data: similarPrompts } = await supabase
        .from('prompts')
        .select('*, profiles(name), comments(rating)')
        .eq('status', 'approved')
        .eq('category', prompt?.category)
        .neq('id', prompt?.id)
        .order('created_at', { ascending: false })
        .limit(4)

    // Fetch comments
    const { data: rawComments } = await supabase
        .from('comments')
        .select('id, content, created_at, rating, profiles(name)')
        .eq('prompt_id', prompt?.id)
        .order('created_at', { ascending: false })

    const comments = (rawComments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        rating: c.rating,
        profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
    }))

    const { data: { user } } = await supabase.auth.getUser()
    // For optimistic UI, get user profile
    let currentUserProfile = null
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()
        currentUserProfile = { ...user, user_metadata: { name: profile?.name } }
    }

    // For admins, we might want them to see pending ones, but for now we enforce 'approved'
    // Or we can let anyone with the exact ID see it, but Phase 1 rule: Only approved prompts are publicly visible.
    if (!prompt || prompt.status !== 'approved') {
        let canView = false

        if (user) {
            if (prompt?.seller_id === user.id) canView = true
            else {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                if (profile?.role === 'admin') canView = true
            }
        }

        if (!canView) {
            notFound()
        }
    }

    let canEdit = false
    if (user) {
        if (prompt.seller_id === user.id) canEdit = true
        else {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            if (profile?.role === 'admin') canEdit = true
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center">
            <div className="w-full max-w-7xl mx-auto px-5 py-8 md:py-12 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-10 xl:gap-x-16">

                    {/* Image Gallery */}
                    <div className="lg:col-span-7 order-1 flex flex-col gap-10">
                        <ImageGallery
                            images={prompt.preview_images || (prompt.preview_image ? [prompt.preview_image] : [])}
                            video={prompt.preview_video}
                            title={prompt.title}
                        />
                    </div>

                    {/* Description & Comments */}
                    <div className="lg:col-span-7 order-3 flex flex-col gap-10">

                        {/* Description */}
                        <div className="flex flex-col gap-3">
                            <h2 className="text-xl font-bold border-b pb-2">About this Prompt</h2>
                            <div
                                className="text-muted-foreground leading-relaxed text-[15px] prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: prompt.description }}
                            />
                        </div>

                        {/* Discussion / Comments Section */}
                        <div className="mt-8 pt-8 border-t">
                            <Comments
                                promptId={prompt.id}
                                initialComments={comments || []}
                                currentUser={currentUserProfile}
                            />
                        </div>
                    </div>

                    {/* Right Column: Details & Actions (Sticky) */}
                    <div className="lg:col-span-5 order-2 lg:row-span-2 flex flex-col items-start gap-8">
                        <div className="sticky top-24 w-full flex flex-col gap-8">

                            {/* Header Info */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge variant="secondary" className="px-3 py-1 rounded-full text-sm">{prompt.category || 'Models'}</Badge>
                                    <Badge variant="outline" className="px-3 py-1 rounded-full text-sm">{prompt.subcategory}</Badge>
                                    {prompt.status !== 'approved' && (
                                        <Badge variant="destructive" className="ml-auto">
                                            Pending Approval
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                                    {prompt.title}
                                </h1>

                                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground border">
                                        {prompt.profiles?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span>by <span className="font-semibold text-foreground">{prompt.profiles?.name || 'Unknown Seller'}</span></span>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex flex-col gap-4 p-6 border rounded-2xl bg-card shadow-sm">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-primary">Points Base</span>
                                    <span className="text-muted-foreground text-sm">premium access</span>
                                </div>
                                <RevealPrompt promptId={prompt.id} fullPrompt={prompt.full_prompt} category={prompt.category} subcategory={prompt.subcategory} />
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Unlock prompts using your points. Earn points by watching ads.
                                </p>
                            </div>

                            {/* Buyer Protection & Usage Info - Adding High-Value Content */}
                            <div className="flex flex-col gap-4 p-6 border rounded-2xl bg-muted/30">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    Buyer Protection
                                </h4>
                                <ul className="text-xs space-y-3 text-muted-foreground">
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span><strong>Free Access:</strong> Enjoy full access to this prompt at no cost during our beta phase.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span><strong>Support:</strong> Community assistance if you face any issues with your experience.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Sticky Sidebar Ad Unit - Only show if the page has significant content depth */}
                            {(prompt.description?.length > 300 || (comments?.length || 0) > 0) && (
                                <div className="w-full bg-background rounded-2xl overflow-hidden mt-2">
                                    <GoogleAd slot="prompt-detail-sidebar" />
                                </div>
                            )}

                            {/* Owner Actions */}
                            {canEdit && (
                                <div className="flex w-full">
                                    <a href={`/edit/${prompt.id}`} className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-semibold shadow-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit Prompt Details
                                        </button>
                                    </a>
                                </div>
                            )}

                        </div>
                    </div>

                </div>

                {/* Similar Prompts Section */}
                {similarPrompts && similarPrompts.length > 0 && (
                    <div className="w-full mt-20 md:mt-32 flex flex-col gap-8 pb-12 border-t pt-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Similar Prompts</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
                            {similarPrompts.map((p: any) => (
                                <PromptCard key={p.id} prompt={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
