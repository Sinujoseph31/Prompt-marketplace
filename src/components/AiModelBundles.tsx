import Link from 'next/link'

const AI_MODELS = [
    { name: 'ChatGPT Prompts', short: 'ChatGPT', bgImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80' },
    { name: 'MidJourney Prompts', short: 'Midjourney', bgImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80' },
    { name: 'DALL‑E Prompts', short: 'DALL-E', bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
    { name: 'Claude Prompts', short: 'Claude', bgImage: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&w=800&q=80' },
    { name: 'Gemini Prompts', short: 'Gemini', bgImage: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?auto=format&fit=crop&w=800&q=80' },
    { name: 'DeepSeek Prompts', short: 'DeepSeek', bgImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Stable Diffusion Prompts', short: 'Stable Diffusion', bgImage: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=800&q=80' },
    { name: 'Other AI Models', short: 'Others', bgImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80' },
]

export default function AiModelBundles() {
    return (
        <section className="w-full max-w-7xl mx-auto px-5 py-4 md:py-16 flex flex-col gap-4 md:gap-10 relative">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-2 md:gap-4 px-2 border-b border-border/40 pb-2 md:pb-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Prompts</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Shop by your preferred AI model</p>
                </div>
                <Link href="/search?category=Models" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
                    View all models <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 px-2">
                {AI_MODELS.map((model) => (
                    <Link
                        key={model.name}
                        href={`/search?category=Models&subcategory=${encodeURIComponent(model.name)}`}
                        className="group flex flex-col items-center justify-center rounded-3xl border border-border/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden h-36 md:h-44 bg-muted/20"
                    >
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${model.bgImage})` }}
                        />
                        {/* Smooth Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:opacity-100 opacity-80" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 z-10 w-full">
                            <span className="font-bold tracking-tight text-white text-base md:text-lg lg:text-xl drop-shadow-md text-center group-hover:scale-105 transition-transform duration-300">
                                {model.short}
                            </span>
                            <div className="h-1 w-8 bg-white/40 rounded-full mt-3 group-hover:w-16 group-hover:bg-white transition-all duration-300" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
