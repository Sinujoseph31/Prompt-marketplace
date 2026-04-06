import { createClient } from '@/utils/supabase/server'
import PromptCard from '@/components/PromptCard'
import PopularPromptsCarousel from '@/components/PopularPromptsCarousel'
import SocialActivityFeed from '@/components/SocialActivityFeed'
import AiModelBundles from '@/components/AiModelBundles'
import CategoryPillsRow from '@/components/CategoryPillsRow'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import GoogleAd from '@/components/GoogleAd'

export default async function Index() {
  const supabase = await createClient()

  // Fetch Latest
  const { data: latestPrompts } = await supabase
    .from('prompts')
    .select('id, title, description, category, subcategory, price, preview_image, preview_images, preview_video, profiles(name), comments(rating)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch Popular
  const { data: popularPrompts } = await supabase
    .from('prompts')
    .select('id, title, description, category, subcategory, price, preview_image, preview_images, preview_video, profiles(name), comments(rating)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="w-full flex flex-col min-h-screen items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-5 py-10 md:py-24 flex flex-col items-center text-center gap-4 md:gap-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-3xl">
          Find the best AI Prompts.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Discover, share, and use top-quality prompts for Midjourney, ChatGPT, DALL-E, and more—all for free.
        </p>
      </section>

      {/* Social Pulse Feed */}
      <div className="w-full max-w-7xl px-5 mb-12">
        <SocialActivityFeed initialPrompts={latestPrompts || []} />
      </div>


      {/* Popular Prompts Carousel */}
      {popularPrompts && popularPrompts.length > 0 && (
        <PopularPromptsCarousel title="Popular Prompts" prompts={popularPrompts} />
      )}

      {/* Primary Homepage Ad — below Popular Prompts - Only show if we have content blocks */}
      {((popularPrompts?.length || 0) + (latestPrompts?.length || 0)) > 2 && (
        <div className="w-full max-w-7xl px-5 mb-16">
          <GoogleAd slot="homepage-top" className="min-h-[100px]" />
        </div>
      )}

      {/* Why Choose Prompt4life Section - Adding High-Value Content */}
      <section className="w-full bg-muted/30 py-16 md:py-24 border-y">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Why Choose Prompt4life?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the most comprehensive marketplace for high-performance AI prompts, ensuring quality, security, and inspiration for your creative projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Vetted Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every prompt in our marketplace is manually reviewed by our expert team to ensure it produces reliable, high-quality results across various AI models.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-background rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">100% Free</h3>
              <p className="text-muted-foreground leading-relaxed">
                Currently, all prompts in our marketplace are completely free to use. Get access to premium prompt engineering without any cost during our initial phase.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-background rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Community Driven</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is built by the community, for the community. Access high-quality prompts and contribute your own to help others master the art of AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-7xl px-5 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it Works</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're looking to enhance your workflow with professional prompts or want to share your creations with the world, Prompt4life makes it simple.
            </p>
            
            <div className="space-y-8 mt-8">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-lg">Browse & Search</h4>
                  <p className="text-muted-foreground">Explore thousands of prompts for Midjourney, ChatGPT, and more using our advanced filters.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-lg">Select & Copy</h4>
                  <p className="text-muted-foreground">Choose a prompt that fits your needs. View the full prompt and implementation instructions instantly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-lg">Deploy & Generate</h4>
                  <p className="text-muted-foreground">Paste the prompt into your favorite AI model and start generating amazing content immediately.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full bg-muted/20 rounded-[2rem] p-8 md:p-12 border aspect-square flex flex-col justify-center gap-6">
            <div className="bg-background p-6 rounded-2xl shadow-xl border-l-4 border-primary relative group/example">
              <p className="text-sm font-medium text-primary mb-2 italic">Prompt Example</p>
              <p className="text-lg font-bold leading-tight">"A futuristic cityscape at sunset, cinematic lighting, 8k resolution, hyper-realistic, neon accents..."</p>
              <a 
                href={`https://chatgpt.com/?q=${encodeURIComponent("A futuristic cityscape at sunset, cinematic lighting, 8k resolution, hyper-realistic, neon accents...")}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-4 right-4 opacity-0 group-hover/example:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1.5 hover:text-primary-foreground"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Try this on AI
              </a>
            </div>
            <div className="bg-background p-6 rounded-2xl shadow-xl border-l-4 border-blue-500 transform translate-x-4">
              <p className="text-sm font-medium text-blue-500 mb-2 italic">ChatGPT Result</p>
              <div className="w-full h-2 bg-muted rounded-full mb-2" />
              <div className="w-3/4 h-2 bg-muted rounded-full mb-2" />
              <div className="w-1/2 h-2 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </section>

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 items-start">
            {latestPrompts?.map((prompt: any) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div >
  )
}
