import { createClient } from '@/utils/supabase/server'
import PromptCard from '@/components/PromptCard'
import PopularPromptsCarousel from '@/components/PopularPromptsCarousel'
import AiModelBundles from '@/components/AiModelBundles'
import CategoryPillsRow from '@/components/CategoryPillsRow'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Index() {
  const supabase = await createClient()

  // Fetch Latest
  const { data: latestPrompts } = await supabase
    .from('prompts')
    .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch Popular
  const { data: popularPrompts } = await supabase
    .from('prompts')
    .select('id, title, description, category, subcategory, price, preview_image, preview_images, profiles(name)')
    .eq('status', 'approved')
    .order('price', { ascending: false })
    .limit(10)

  return (
    <div className="w-full flex flex-col min-h-screen items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-5 py-10 md:py-24 flex flex-col items-center text-center gap-4 md:gap-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl">
          Find the best AI Prompts.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Discover, buy, and sell top-quality prompts for Midjourney, ChatGPT, DALL-E, and more.
        </p>
      </section>

      {/* Popular Prompts Carousel */}
      {popularPrompts && popularPrompts.length > 0 && (
        <PopularPromptsCarousel title="Popular Prompts" prompts={popularPrompts} />
      )}

      {/* AI Model Bundles */}
      <AiModelBundles />

      {/* Latest Prompts Grid */}
      <div className="w-full max-w-7xl px-5 py-6 md:py-12 flex-1 flex flex-col gap-4 md:gap-8">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-bold tracking-tight">Latest Additions</h2>
          <Link href="/search" className="text-sm font-semibold text-primary hover:text-primary/80">View all</Link>
        </div>
        {latestPrompts?.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p className="text-lg">No prompts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 items-start">
            {latestPrompts?.map((prompt: any) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div >
  )
}
