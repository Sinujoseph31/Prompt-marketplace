import { createClient } from '@/utils/supabase/server'
import PromptCard from '@/components/PromptCard'
import CategoryPillsRow from '@/components/CategoryPillsRow'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const CATEGORIES: Record<string, string[]> = {
    'Models': ['ChatGPT Prompts', 'Claude Prompts', 'Gemini Prompts', 'DeepSeek Prompts', 'MidJourney Prompts', 'DALL‑E Prompts', 'Stable Diffusion Prompts', 'Other AI Models'],
    'Art & Illustrations': ['Drawing & Sketches', 'Cartoons & Comics', 'Painting Styles (gouache, pop art, surrealism)', 'Character & Portrait Art', 'Fantasy & Surrealism', 'Decorative Art (coloring books, posters, stickers)', 'Experimental & Mixed Media'],
    'Logos & Icons': ['All'],
    'Graphics & Design': ['Posters & Flyers', 'Infographics', 'UI/UX Elements', 'Profile Picture'],
    'Productivity & Writing': ['Copywriting Prompts', 'Blog/Article Generation', 'Email Templates', 'Task Management & Workflow Prompts'],
    'Marketing & Business': ['Social Media Content', 'Ad Copy Generation', 'Branding Concepts', 'Business Pitch Decks'],
    'Photography': ['Portrait Styles', 'Landscape Prompts', 'Product Photography', 'Cinematic Photography'],
    'Games & 3D': ['Character Models', 'Environment/World Design', 'Game Asset Packs', '3D Object Rendering']
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; subcategory?: string; q?: string }>
}) {
    const supabase = await createClient()
    const resolvedParams = await searchParams
    const category = resolvedParams?.category
    const subcategory = resolvedParams?.subcategory
    const searchQuery = resolvedParams?.q

    // 1. Fetch Exact Matches
    let query = supabase
        .from('prompts')
        .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (subcategory) query = query.eq('subcategory', subcategory)

    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    const { data: prompts } = await query

    // 2. Fetch "Related Prompts" (same category, excluding exact exact matches if possible)
    let relatedPrompts: any[] = []
    if (category && prompts && prompts.length > 0) {
        // Find prompts in this main category, that aren't the exact same subcategory (to show variety)
        const currentIds = prompts.map(p => p.id)

        let relatedQuery = supabase
            .from('prompts')
            .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
            .eq('status', 'approved')
            .eq('category', category)
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: rPrompts } = await relatedQuery

        // Filter out prompts already shown in the exact matches section
        relatedPrompts = (rPrompts || []).filter(rp => !currentIds.includes(rp.id))
    } else if (searchQuery && prompts && prompts.length > 0) {
        // If it was a text search, related prompts can be anything from the category of the first result
        const firstResultCategory = prompts[0].category
        const currentIds = prompts.map(p => p.id)

        let relatedQuery = supabase
            .from('prompts')
            .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
            .eq('status', 'approved')
            .eq('category', firstResultCategory)
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: rPrompts } = await relatedQuery
        relatedPrompts = (rPrompts || []).filter(rp => !currentIds.includes(rp.id))
    }

    const MAIN_CATEGORIES = Object.keys(CATEGORIES)
    const activeSubcategories = category ? (CATEGORIES[category] || []) : []

    return (
        <div className="w-full flex flex-col min-h-screen items-center bg-muted/10">

            {/* Always show pills so users can easily pivot */}
            <CategoryPillsRow
                category={category}
                subcategory={subcategory}
                mainCategories={MAIN_CATEGORIES}
                activeSubcategories={activeSubcategories}
            />

            <div className="w-full max-w-7xl px-5 py-6 md:py-10 flex flex-col gap-10">

                {/* Section 1: Exact Matches */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 border-b pb-4">
                        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back Home
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            {searchQuery
                                ? `Results for "${searchQuery}"`
                                : subcategory
                                    ? subcategory
                                    : category ? `${category} Prompts` : `All Prompts`}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {prompts?.length || 0} {prompts?.length === 1 ? 'prompt' : 'prompts'} found
                        </p>
                    </div>

                    {prompts?.length === 0 ? (
                        <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-4 bg-background rounded-2xl border shadow-sm">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xl font-semibold text-foreground">No matches found</p>
                                <p className="text-base text-muted-foreground max-w-sm mx-auto">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                            </div>
                            <Link href="/search">
                                <Button variant="outline" className="mt-2">Clear Filters</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 items-start">
                            {prompts?.map((prompt: any) => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Section 2: Related Prompts */}
                {relatedPrompts && relatedPrompts.length > 0 && (
                    <div className="flex flex-col gap-6 mt-12 bg-background p-6 md:p-10 rounded-3xl border shadow-sm">
                        <div className="flex flex-col gap-1 border-b pb-4">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">You might also like</h2>
                            <p className="text-muted-foreground">More prompts from related categories.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 items-start">
                            {relatedPrompts.map((prompt: any) => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
