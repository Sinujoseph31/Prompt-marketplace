'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PromptResponse {
    analysis: string
    prompts: string[]
}

// Client component to handle asynchronous image loading states safely
function AiGeneratedImage({ prompt }: { prompt: string }) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    const handleGenerate = () => {
        setIsGenerating(true)
        setHasError(false)
        const cleanPrompt = prompt.replace(/\n/g, ' ').trim().substring(0, 800)
        setImageUrl(`/api/generate-image?prompt=${encodeURIComponent(cleanPrompt)}&t=${Date.now()}`)
    }

    if (!hasGenerated && !isGenerating) {
        return (
            <div className="w-full aspect-[4/3] bg-muted/30 border-b border-border/40 flex flex-col items-center justify-center p-6 gap-3 text-center group-hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-xs font-medium text-muted-foreground max-w-[180px]">Visualize this concept</p>
                <Button variant="outline" size="sm" onClick={handleGenerate} className="mt-1 w-full max-w-[160px] h-8 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">
                    Generate Image
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full aspect-[4/3] bg-muted relative border-b border-border/40 overflow-hidden group">
            {isGenerating && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 z-0 bg-muted/80 backdrop-blur-sm">
                    <div className="relative">
                        <div className="w-10 h-10 border-2 border-muted-foreground/20 rounded-full"></div>
                        <div className="w-10 h-10 border-2 border-primary rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                    </div>
                    <span className="text-xs font-semibold tracking-wide">Synthesizing...</span>
                </div>
            )}

            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive gap-2 z-0 bg-destructive/5 p-4 text-center">
                    <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="text-xs font-medium">Generation Failed</span>
                    <Button variant="outline" size="sm" onClick={handleGenerate} className="h-7 mt-1 text-[10px] uppercase tracking-wider border-destructive/30 hover:bg-destructive/10">Try Again</Button>
                </div>
            ) : (
                imageUrl && (
                    <>
                        <img
                            src={imageUrl}
                            alt="AI Generated Representation"
                            className={`w-full h-full object-cover transition-all duration-1000 ${isGenerating ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'} relative z-10 group-hover:scale-105`}
                            onLoad={() => {
                                setIsGenerating(false)
                                setHasGenerated(true)
                            }}
                            onError={() => {
                                setIsGenerating(false)
                                setHasError(true)
                            }}
                            loading="lazy"
                        />
                        <button
                            onClick={handleGenerate}
                            className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md shadow-lg translate-y-2 group-hover:translate-y-0"
                            title="Regenerate Image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </>
                )
            )}
        </div>
    )
}

export default function ImageToPromptPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('Any')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<PromptResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const categories = [
        "Any",
        "Trending 2026: Dreamcore Surrealism",
        "Trending 2026: Biophilic Organic Art",
        "Trending 2026: NeRF / 3D Gaussian Splatting",
        "Trending 2026: Next-Gen Unreal Engine 5",
        "Trending 2026: Retro-Futurism / Synthwave",
        "Trending 2026: Data-driven Abstract AI",
        "Trending: Isometric 3D Rendering",
        "Trending: Retro Vintage Film",
        "Trending: Hyper-Photorealistic Portrait",
        "Trending: Dark Fantasy / Gothic",
        "Trending: Cyberpunk / Neon Noir",
        "Trending: Digital Renaissance",
        "Trending: Paper Quilling Art",
        "Trending: Minimalist Line Art",
        "Indian Wedding Invitation",
        "Indian Wedding Photoshoot",
        "Birthday Celebration",
        "Commercial Brand Campaign",
        "Hyper-realistic Divine Cinematic",
        "Indian Couple Photography",
        "Indian Fashion & E-commerce",
        "Interior Design & Real Estate",
        "Jewelry Photoshoot",
        "Newborn Photography",
        "Surreal Miniature Photography",
        "Cinematic Sci-Fi",
        "Anime / Studio Ghibli"
    ]

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                setSelectedImage(event.target.result)
                setError(null)
                setResult(null)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleGenerate = async () => {
        if (!selectedImage) return

        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/generate-prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: selectedImage, category: selectedCategory }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to generate prompts.')
            }

            const data: PromptResponse = await res.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex justify-center pb-24">
            <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col gap-12">

                {/* Header Sequence */}
                <div className="flex flex-col gap-5 text-center items-center max-w-3xl mx-auto">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 px-4 py-1.5 rounded-full hover:bg-muted mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Marketplace
                    </Link>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Inspire Engine
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                        Image to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Prompt</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/90 font-medium">
                        Upload any visual reference. Our specialized AI models will deconstruct its style, lighting, and subjects to generate perfect prompts.
                    </p>
                </div>

                {/* Main Content Grid: 12-column asymmetric layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Sidebar: Uploader & Controls */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6 w-full">
                        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-border/50 relative overflow-hidden group transition-all">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <h2 className="text-lg font-bold tracking-tight">1. Source Image</h2>
                                {selectedImage && (
                                    <button onClick={() => { setSelectedImage(null); setResult(null); }} className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10">
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div
                                className={`w-full aspect-[4/5] rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 cursor-pointer overflow-hidden relative ${selectedImage ? 'border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.1)]' : 'border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedImage ? (
                                    <img src={selectedImage} alt="Uploaded inspiration" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-muted-foreground relative z-10">
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                                            <svg className="w-8 h-8 text-foreground/70 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-semibold text-foreground text-sm">Drag & drop or click</p>
                                            <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">High-Res JPG/PNG (Max 50MB)</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="flex flex-col gap-2.5 mt-6 relative z-10">
                                <label className="text-sm font-bold tracking-tight text-foreground">2. Aesthetic Style (Optional)</label>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full h-12 px-4 appearance-none border border-border rounded-xl bg-background/50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm backdrop-blur-sm cursor-pointer hover:bg-background"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2 relative z-10">
                                    <svg className="w-4 h-4 text-destructive shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-xs text-destructive font-semibold leading-relaxed">{error}</p>
                                </div>
                            )}

                            <Button
                                className="w-full h-14 mt-6 text-base font-bold shadow-[0_8px_20px_rgba(var(--primary),0.2)] hover:shadow-[0_12px_25px_rgba(var(--primary),0.3)] transition-all rounded-xl relative z-10 overflow-hidden group overflow-hidden"
                                disabled={!selectedImage || isLoading}
                                onClick={handleGenerate}
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Extracting Prompts...
                                    </div>
                                ) : 'Generate Variants'}
                            </Button>
                        </div>
                    </div>

                    {/* Right Content: Analysis & Generated Results */}
                    <div className="lg:col-span-8 flex flex-col gap-8 w-full min-h-[500px]">
                        {!result && !isLoading ? (
                            <div className="h-full w-full flex flex-col items-center justify-center text-center gap-5 p-10 border-2 border-dashed border-border/60 rounded-3xl bg-card/30 text-muted-foreground flex-1 min-h-[500px]">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2">
                                    <svg className="w-10 h-10 opacity-40 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Awaiting Inspiration</h3>
                                <p className="text-base max-w-sm mx-auto font-medium">Upload a source image on the left to instantly reveal detailed AI analysis and perfectly crafted prompt variants.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="h-full w-full flex flex-col items-center justify-center text-center gap-8 p-10 border rounded-3xl bg-card/50 backdrop-blur-sm shadow-sm flex-1 min-h-[500px]">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-muted rounded-full"></div>
                                    <div className="w-24 h-24 border-4 border-primary rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground animate-pulse">Deconstructing Image...</h3>
                                    <p className="text-muted-foreground font-medium max-w-md mx-auto">Our Gemini Vision models are isolating compositional elements, color science, and lighting techniques to build your prompts.</p>
                                </div>
                            </div>
                        ) : result && (
                            <div className="flex flex-col gap-8 flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700">

                                {/* Aesthetic Analysis Banner */}
                                <div className="flex flex-col gap-4 bg-gradient-to-br from-primary/10 via-background to-card border border-primary/20 p-6 sm:p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex items-center gap-3 text-primary mb-1">
                                        <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm border border-primary/10">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </div>
                                        <h3 className="font-extrabold text-xl tracking-tight">Vision Analysis</h3>
                                    </div>
                                    <p className="text-base leading-relaxed text-foreground font-medium max-w-3xl relative z-10">
                                        {result.analysis}
                                    </p>
                                </div>

                                {/* Results Grid (Replaces Slider) */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <h3 className="font-extrabold text-2xl tracking-tight flex items-center gap-3">
                                            Crafted Variations
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                                {result.prompts.length}
                                            </span>
                                        </h3>
                                        {selectedCategory !== 'Any' && (
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-background border shadow-sm text-sm font-bold text-muted-foreground self-start sm:self-auto">
                                                Applied Style: <span className="text-primary ml-1.5">{selectedCategory}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                        {result.prompts.map((promptText, idx) => (
                                            <div
                                                key={idx}
                                                className="group w-full flex flex-col p-0 bg-card border shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-border/80 transition-all duration-300 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-6"
                                                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                            >
                                                {/* Image Generation Client Component */}
                                                <AiGeneratedImage prompt={promptText} />

                                                <div className="flex flex-col gap-4 p-6 flex-1 bg-gradient-to-b from-transparent to-muted/20">
                                                    <p className="text-sm font-medium text-foreground leading-relaxed flex-1 select-text">
                                                        {promptText}
                                                    </p>
                                                    <div className="flex justify-between items-center pt-4 border-t border-border/60 mt-auto">
                                                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">Variant 0{idx + 1}</span>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleCopy(promptText, idx)}
                                                            className={`h-9 px-4 text-xs font-bold tracking-wide flex items-center gap-2 transition-all rounded-xl shadow-sm ${copiedIndex === idx ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <>
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                    Copy Prompt
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
