'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SmilePlus, Copy, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'

type MemeResponse = {
    meme_format_idea: string;
    top_text: string;
    bottom_text: string;
    image_prompt_for_background: string;
}

export default function MemeArchitectPage() {
    const [topic, setTopic] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<MemeResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim()) return;

        setIsGenerating(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/meme-architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to generate meme')
            }

            const data = await res.json()
            setResult(data.result)

            setTimeout(() => {
                document.getElementById('meme-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsGenerating(false)
        }
    }

    const copyPrompt = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.image_prompt_for_background)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 relative selection:bg-amber-500/30 pb-20">
            <div className="w-full max-w-4xl px-5 pt-12 md:pt-20 flex flex-col gap-10 md:gap-14">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-5 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/30 shadow-sm uppercase tracking-widest text-xs font-bold">
                        <SmilePlus className="w-4 h-4 mr-2" />
                        Viral Content Studio
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground drop-shadow-sm">
                        Meme Architect
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl px-4">
                        Give us a topic. Our AI will design a highly-relatable meme concept, generate the punchline, and write the perfect master prompt to create the background image.
                    </p>
                </div>

                {/* Input Area */}
                <div className="w-full rounded-[2.5rem] bg-card border border-border/50 shadow-xl p-6 md:p-10 flex flex-col gap-6 relative overflow-hidden">
                    <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
                        <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Forgetting to save your code... or Mondays."
                            className="h-16 rounded-2xl md:rounded-full bg-muted/30 border-2 border-transparent focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-lg md:text-xl px-8 shadow-inner"
                        />
                        <Button
                            type="submit"
                            disabled={isGenerating || !topic.trim()}
                            className="h-16 px-10 md:px-12 rounded-2xl md:rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg md:text-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Cooking...</>
                            ) : (
                                <><Sparkles className="w-6 h-6 mr-2" /> Generate Meme</>
                            )}
                        </Button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20 font-bold text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && !isGenerating && (
                    <div id="meme-results" className="w-full flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">

                        {/* The Meme Preview Box */}
                        <div className="w-full max-w-2xl mx-auto rounded-3xl bg-zinc-900 border-4 border-zinc-800 p-8 md:p-12 shadow-2xl relative flex flex-col items-center justify-between min-h-[400px] text-center overflow-hidden">
                            {/* Watermark grid background */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-sm font-sans drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-10" style={{ WebkitTextStroke: '2px black' }}>
                                "{result.top_text}"
                            </h2>

                            <div className="my-10 p-6 bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-white/10 w-full flex items-center justify-center italic text-zinc-300 font-medium relative z-10">
                                <ImageIcon className="w-6 h-6 mr-3 text-zinc-500 shrink-0" />
                                {result.meme_format_idea}
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-sm font-sans drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-10" style={{ WebkitTextStroke: '2px black' }}>
                                "{result.bottom_text}"
                            </h2>
                        </div>

                        {/* Midjourney Prompt Generator Box */}
                        <div className="w-full rounded-3xl bg-card border border-amber-500/20 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6 group">
                            <div className="flex-shrink-0 bg-amber-500/10 p-4 rounded-2xl hidden md:block group-hover:bg-amber-500/20 transition-colors">
                                <Sparkles className="w-8 h-8 text-amber-500" />
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                <h3 className="font-bold text-lg">Background Image Prompt</h3>
                                <p className="text-muted-foreground font-mono text-sm leading-relaxed bg-muted/50 p-4 rounded-xl shadow-inner border border-border selection:bg-amber-500/20">
                                    {result.image_prompt_for_background}
                                </p>
                            </div>

                            <Button
                                size="lg"
                                onClick={copyPrompt}
                                className={`shrink-0 rounded-2xl h-14 font-bold md:min-w-[160px] transition-all ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary text-primary-foreground'}`}
                            >
                                {copied ? (
                                    <><Copy className="w-5 h-5 mr-2" /> Copied!</>
                                ) : (
                                    <><ImageIcon className="w-5 h-5 mr-2" /> Copy Background Prompt</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
