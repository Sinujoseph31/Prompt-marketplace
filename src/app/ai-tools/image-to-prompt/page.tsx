'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, UploadCloud, Copy, X, Loader2, ArrowRight, ArrowLeft, Wand2, Eye, Focus, Zap, ImageIcon } from 'lucide-react'

// Trendy & Unique Styles
const TRENDING_STYLES = [
    { id: 'cinematic', name: 'Cinematic 8k', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80' },
    { id: 'midjourney-v6', name: 'Midjourney Raw', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' },
    { id: 'hyperreal', name: 'Hyperrealistic', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
    { id: 'anime', name: 'Anime Style', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80' },
    { id: 'isometric', name: '3D Isometric', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=400&q=80' },
    { id: 'vaporwave', name: 'Vaporwave', image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&q=80' },
    { id: 'dark-fantasy', name: 'Dark Fantasy', image: 'https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=400&q=80' },
    { id: 'origami', name: 'Paper Quilling', image: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=400&q=80' },
    { id: 'polaroid', name: 'Vintage Polaroid', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80' },
    { id: 'watercolor', name: 'Ethereal Watercolor', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80' },
    { id: 'macro', name: 'Macro Photography', image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&q=80' }
]

const IDEAS = [
    "A lone astronaut floating in an ocean of bioluminescent jellyfish",
    "A futuristic coffee shop built entirely inside a giant hollowed-out tree",
    "A dramatic showdown between a samurai and a mechanical dragon in the rain",
    "An isometric view of a cozy witch's apothecary filled with glowing potions",
]

type PromptVariant = {
    title: string;
    focus: string;
    prompt: string;
}

export default function ImageToPromptPage() {
    const [selectedStyle, setSelectedStyle] = useState<string>('cinematic')
    const [promptText, setPromptText] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSurprising, setIsSurprising] = useState(false)
    const [results, setResults] = useState<PromptVariant[] | null>(null)
    const [currentSlide, setCurrentSlide] = useState(0)

    const [error, setError] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError("Please select a valid image file.")
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string)
            setError(null)
            // If they upload an image, clear previous results
            if (results) setResults(null)
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSurpriseMe = async () => {
        if (imagePreview) {
            setIsSurprising(true);
            try {
                const splitDataURI = imagePreview.split(',')
                const mimeMatch = splitDataURI[0].match(/:(.*?);/)
                const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
                const imageBase64 = splitDataURI[1]

                const res = await fetch('/api/surprise-image-idea', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64, mimeType })
                })
                if (res.ok) {
                    const data = await res.json()
                    setPromptText(data.idea)
                }
            } catch (err) {
                console.error("Surprise image error", err)
            } finally {
                setIsSurprising(false);
            }
        } else {
            const randomIdea = IDEAS[Math.floor(Math.random() * IDEAS.length)]
            setPromptText(randomIdea)
        }
    }

    const handleGenerate = async () => {
        if (!promptText.trim() && !imagePreview) return;

        setIsGenerating(true)
        setError(null)
        setResults(null)
        setCurrentSlide(0)

        try {
            let imageBase64 = null;
            let mimeType = null;

            if (imagePreview) {
                const splitDataURI = imagePreview.split(',')
                const mimeMatch = splitDataURI[0].match(/:(.*?);/)
                mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
                imageBase64 = splitDataURI[1]
            }

            const styleObj = TRENDING_STYLES.find(s => s.id === selectedStyle);
            const styleName = styleObj ? styleObj.name : selectedStyle;

            const res = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: promptText,
                    style: styleName,
                    imageBase64,
                    mimeType
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to generate prompt variants')
            }

            const data = await res.json()
            setResults(data.result)

            // Smooth scroll to results
            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const unstyledResult = results ? results[currentSlide] : null;

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-background relative selection:bg-primary/20 pb-20">
            <div className="w-full max-w-5xl px-5 pt-8 md:pt-16 flex flex-col gap-10">

                {/* Header Section */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="secondary" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 shadow-sm uppercase tracking-widest text-[10px] sm:text-xs">
                        <Wand2 className="w-3.5 h-3.5 mr-2" />
                        Next-Gen Prompt Lab
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
                        Brainstorm. Upload. <br className="md:hidden" /> Generate.
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-2xl px-4">
                        Mix your ideas with reference images and trending styles. Our AI will craft 4 unique, highly-optimized master prompts for Midjourney & DALL-E.
                    </p>
                </div>

                {/* THE MAIN BUILDER WORKSPACE */}
                <div className="w-full rounded-[2.5rem] bg-card border border-border/50 shadow-2xl p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden">
                    {/* Background decoration inside card */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mt-20 -mr-20"></div>

                    {/* 1. Input Section */}
                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" /> 1. What's your vision?
                            </h3>
                            <Button variant="ghost" size="sm" onClick={handleSurpriseMe} disabled={isSurprising} className="text-xs font-semibold text-muted-foreground hover:text-primary">
                                {isSurprising ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                                Surprise Me
                            </Button>
                        </div>

                        <div className="relative group rounded-3xl overflow-hidden bg-background border-2 border-muted hover:border-primary/50 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 flex flex-col">
                            <Textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                placeholder="A lone cyborg samurai standing in a neon-lit alleyway..."
                                className="min-h-[120px] w-full resize-none border-0 bg-transparent p-6 text-base md:text-lg focus-visible:ring-0 shadow-none placeholder:text-muted"
                            />

                            {/* Inner Bottom Action Bar inside Textarea Container */}
                            <div className="p-4 pt-0 flex justify-between items-end">
                                {/* Image Attachment Area */}
                                <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-border/50 shadow-sm">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    {imagePreview ? (
                                        <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border-2 border-primary shadow-sm group/img">
                                            <img src={imagePreview} alt="Attached Reference" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="bg-black/60 hover:bg-red-500 rounded-full p-2 text-white transition-colors shadow-lg"
                                                    title="Remove Image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-xl border-dashed border-2 hover:border-primary border-muted-foreground/30 text-muted-foreground hover:text-primary hover:bg-primary/5 h-12 md:h-14 px-4 shadow-none"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <UploadCloud className="w-5 h-5 mr-2" />
                                            <span className="font-semibold text-sm">Upload Image</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {imagePreview && <p className="text-xs text-muted-foreground px-2">An image is attached. Use "Surprise Me" to analyze it for an idea, or type your own text.</p>}
                    </div>

                    {/* 2. Trending Styles */}
                    <div className="flex flex-col gap-4 relative z-10 w-full">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" /> 2. Choose an Aesthetic
                        </h3>

                        {/* Horizontal Scrollable Slider for Categories */}
                        <div className="flex overflow-x-auto pb-6 -mx-2 px-2 gap-4 snap-x scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            {TRENDING_STYLES.map((style) => {
                                const isSelected = selectedStyle === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`
                                            snap-start shrink-0 h-40 w-40 md:h-48 md:w-48 rounded-3xl overflow-hidden relative group transition-all duration-300 text-left
                                            ${isSelected
                                                ? 'ring-4 ring-primary ring-offset-2 ring-offset-background shadow-xl scale-[1.02]'
                                                : 'hover:scale-105 hover:shadow-lg border border-border/50 saturate-75 hover:saturate-100 opacity-90 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        <img src={style.image} alt={style.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <div className="absolute inset-x-0 bottom-0 p-4">
                                            <span className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md relative z-10">
                                                {style.name}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md animate-in zoom-in duration-300">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Generate Button Wrapper */}
                    <div className="w-full flex justify-end mt-2 border-t pt-8">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || (!promptText.trim() && !imagePreview)}
                            className="rounded-full h-14 px-8 text-base font-bold shadow-xl flex items-center gap-2 transition-all hover:scale-105 w-full md:w-auto overflow-hidden relative"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="absolute inset-0 bg-primary-foreground/10 animate-pulse"></span>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Crafting 4 Unique Prompts...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 fill-current" />
                                    Generate Master Prompts
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium text-center shadow-sm">
                        {error}
                    </div>
                )}

                {/* RESULTS SECTION: The Carousel */}
                {results && !isGenerating && (
                    <div id="results-section" className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                Your <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl">4 Variants</span>
                            </h2>
                            {/* Desktop Controls */}
                            <div className="hidden sm:flex gap-2">
                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-primary/20 text-primary hover:bg-primary/10" disabled={currentSlide === 0} onClick={() => setCurrentSlide(c => c - 1)}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-primary/20 text-primary hover:bg-primary/10" disabled={currentSlide === 3} onClick={() => setCurrentSlide(c => c + 1)}>
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Slider Container */}
                        <div className="relative w-full rounded-[2.5rem] bg-black text-white p-8 md:p-12 shadow-2xl overflow-hidden border border-white/10 ring-1 ring-primary/20">
                            {/* Abstract glows */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none mix-blend-screen"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none mix-blend-screen"></div>

                            {/* Content corresponding to currentSlide */}
                            {unstyledResult && (
                                <div className="flex flex-col gap-6 relative z-10 animate-in fade-in zoom-in-95 duration-500 key={currentSlide}">

                                    <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-white text-black hover:bg-white border-0 font-bold px-3 py-1 text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                                Variant {currentSlide + 1} of 4
                                            </Badge>
                                            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{unstyledResult.title}</h3>
                                        </div>
                                        <p className="text-white/70 font-medium flex items-center gap-2 mt-1">
                                            <Focus className="w-4 h-4 text-green-400" /> {unstyledResult.focus}
                                        </p>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-fuchsia-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                        <p className="relative w-full min-h-[150px] p-6 rounded-3xl bg-white/5 border border-white/10 font-mono text-sm md:text-base leading-relaxed text-white/90 shadow-inner selection:bg-primary/50">
                                            {unstyledResult.prompt}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                                        <Button
                                            size="lg"
                                            onClick={() => copyToClipboard(unstyledResult.prompt, `variant-${currentSlide}`)}
                                            className={`w-full sm:w-auto rounded-2xl h-14 px-8 text-base font-bold shadow-xl transition-all hover:-translate-y-1 ${copiedKey === `variant-${currentSlide}` ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                                        >
                                            {copiedKey === `variant-${currentSlide}` ? (
                                                <><Sparkles className="w-5 h-5 mr-2" /> Copied Successfully!</>
                                            ) : (
                                                <><Copy className="w-5 h-5 mr-2" /> Copy to Clipboard</>
                                            )}
                                        </Button>

                                        {/* Mobile / Alternative Slider Details */}
                                        <div className="flex gap-2 sm:hidden">
                                            <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10" disabled={currentSlide === 0} onClick={() => setCurrentSlide(c => c - 1)}>
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10" disabled={currentSlide === 3} onClick={() => setCurrentSlide(c => c + 1)}>
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        <div className="hidden sm:flex items-center gap-1.5 px-4">
                                            {[0, 1, 2, 3].map((idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentSlide(idx)}
                                                    className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-primary scale-125 shadow-[0_0_10px_hsl(var(--primary))]' : 'bg-white/20 hover:bg-white/40'}`}
                                                    aria-label={`Go to slide ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
