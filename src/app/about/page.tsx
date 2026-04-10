import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'About Us | Prompt4life',
  description: 'Learn about Prompt4life, the leading marketplace for high-quality, vetted AI prompts for ChatGPT, Midjourney, and more.',
}

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Header */}
      <section className="w-full bg-muted/30 border-b py-20 px-5 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Empowering Creative AI.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Prompt4life is a community-driven marketplace built to help creators, engineers, and artists master the art of prompt engineering.
        </p>
      </section>

      <div className="w-full max-w-4xl px-5 py-20 flex flex-col gap-16">
        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              In the rapidly evolving world of Artificial Intelligence, the quality of your output is only as good as your input. Our mission is to democratize high-quality prompt engineering by providing a platform where the best prompts are accessible to everyone.
            </p>
            <p className="text-muted-foreground">
              We believe that with the right tools, anyone can unlock the full potential of AI models like GPT-4, Midjourney, and Claude.
            </p>
          </div>
          <div className="bg-primary/5 rounded-[2.5rem] p-10 border-2 border-primary/10 flex items-center justify-center aspect-square">
            <div className="text-primary scale-[2.5] opacity-80">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
        </div>

        {/* Quality First */}
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-center">Why We're Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 border rounded-3xl bg-card hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold mb-4">Vetted Content</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Every prompt submitted to our platform undergoes a manual review process. We test for reliability, output quality, and safety.
                    </p>
                </div>
                <div className="p-8 border rounded-3xl bg-card hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold mb-4">True Innovation</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We don't just host generic prompts. We prioritize techniques like Chain of Thought, few-shot prompting, and creative styling.
                    </p>
                </div>
                <div className="p-8 border rounded-3xl bg-card hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold mb-4">Community Focused</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Prompt4life is built for the community. We reward top contributors and provide tools for prompt testing and iteration.
                    </p>
                </div>
            </div>
        </div>

        {/* Call to Action */}
        <div className="bg-foreground text-background rounded-[3rem] p-12 md:p-16 flex flex-col items-center text-center gap-8">
            <h2 className="text-3xl md:text-5xl font-black">Ready to build something amazing?</h2>
            <p className="text-lg opacity-80 max-w-xl">
                Join thousands of creators using Prompt4life to supercharge their AI workflows today.
            </p>
            <div className="flex gap-4">
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                    <Link href="/search">Explore Prompts</Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="rounded-full bg-transparent border-white/20 hover:bg-white/10 text-white font-bold px-8">
                    <Link href="/signup">Join the Community</Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
