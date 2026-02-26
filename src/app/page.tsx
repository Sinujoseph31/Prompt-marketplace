import { createClient } from '@/utils/supabase/server'
import PromptCard from '@/components/PromptCard'
import PopularPromptsCarousel from '@/components/PopularPromptsCarousel'
import AiModelBundles from '@/components/AiModelBundles'
import CategoryPillsRow from '@/components/CategoryPillsRow'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Index({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string; q?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const category = resolvedParams?.category
  const subcategory = resolvedParams?.subcategory
  const searchQuery = resolvedParams?.q

  let query = supabase
    .from('prompts')
    .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (subcategory) query = query.eq('subcategory', subcategory)

  // Global search across title and description
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  const { data: prompts } = await query

  const { data: popularPrompts } = await supabase
    .from('prompts')
    .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
    .eq('status', 'approved')
    .order('price', { ascending: false })
    .limit(10)

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

  const MAIN_CATEGORIES = Object.keys(CATEGORIES)
  const activeSubcategories = category ? (CATEGORIES[category] || []) : []

  return (
    <div className="w-full flex flex-col min-h-screen items-center">
      {/* Conditional Header / Hero Section */}
      {!category && !searchQuery ? (
        <section className="w-full max-w-7xl px-5 py-10 md:py-24 flex flex-col items-center text-center gap-4 md:gap-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl">
            Find the best AI Prompts.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Discover, buy, and sell top-quality prompts for Midjourney, ChatGPT, DALL-E, and more.
          </p>
        </section>
      ) : (
        <section className="w-full max-w-7xl px-5 py-6 md:py-12 flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : subcategory
                ? subcategory
                : `${category} Prompts`}
          </h1>
          {category && (
            <p className="text-muted-foreground">
              Browse the best prompts in this category.
            </p>
          )}
        </section>
      )}

      {/* Popular Prompts Carousel (Always visible per user request) */}
      {popularPrompts && popularPrompts.length > 0 && (
        <PopularPromptsCarousel title="Popular Prompts" prompts={popularPrompts} />
      )}

      {/* AI Model Bundles (Only on main page without filters) */}
      {!searchQuery && !category && (
        <AiModelBundles />
      )}

      {/* Category Pills */}
      <CategoryPillsRow
        category={category}
        subcategory={subcategory}
        mainCategories={MAIN_CATEGORIES}
        activeSubcategories={activeSubcategories}
      />

      {/* Prompts Grid */}
      <div className="w-full max-w-7xl px-5 py-6 md:py-12 flex-1">
        {prompts?.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-lg">
              {searchQuery ? `No prompts found matching "${searchQuery}"` : "No prompts found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 items-start">
            {prompts?.map((prompt: any) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div >
  )
}
