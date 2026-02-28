'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dices, Copy, Loader2, Zap, Sparkles } from 'lucide-react'

type ChaosVariant = {
    chaos_level: string;
    prompt: string;
    tags: string[];
}

export default function ChaosGeneratorPage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<ChaosVariant | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Animation state for the slot machine effect
    const [slotText, setSlotText] = useState("AWAITING CHAOS...")

    const handleReleaseChaos = async () => {
        setIsGenerating(true)
        setError(null)
        setResult(null)

        // Fun slot machine animation text while waiting
        const slotInterval = setInterval(() => {
            const gibberish = ["CYBER SLOTH...", "NEON GRANDMA...", "RADIOACTIVE TACO...", "LASER PENGUIN...", "QUANTUM TOASTER..."];
            setSlotText(gibberish[Math.floor(Math.random() * gibberish.length)])
        }, 150);

        try {
            const res = await fetch('/api/chaos-generator', { method: 'POST' })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'The universe rejected your chaos request.')
            }

            const data = await res.json()
            clearInterval(slotInterval)
            setResult(data.result)

        } catch (err: any) {
            clearInterval(slotInterval)
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 relative selection:bg-fuchsia-500/30 pb-20 overflow-hidden font-sans">

            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

            <div className="w-full max-w-4xl px-5 pt-12 md:pt-20 flex flex-col gap-10 md:gap-14 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-5 py-2 bg-black/50 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)] uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                        <Zap className="w-3.5 h-3.5 mr-2" />
                        Surprise Discovery Engine
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                        THE CHAOS <br className="md:hidden" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 animate-pulse">GENERATOR</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl px-4">
                        Writer's block? Pull the lever to generate a massive, highly-detailed, and completely unhinged AI prompt seed.
                    </p>
                </div>

                {/* The "Slot Machine" Engine */}
                <div className="w-full rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl p-8 md:p-12 flex flex-col items-center gap-8 relative overflow-hidden group">
                    <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"></div>

                    {/* The Screen */}
                    <div className="w-full max-w-2xl h-32 md:h-40 bg-zinc-950 rounded-2xl border-2 border-white/5 shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20"></div> {/* Scanlines */}

                        <span className={`font-mono text-xl md:text-3xl font-bold tracking-widest uppercase z-10 text-center px-4 ${isGenerating ? 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]' : 'text-zinc-600'}`}>
                            {isGenerating ? slotText : (result ? "CHAOS ACQUIRED" : "SYSTEM IDLE")}
                        </span>
                    </div>

                    <Button
                        onClick={handleReleaseChaos}
                        disabled={isGenerating}
                        className="group relative h-20 px-12 md:px-16 text-xl md:text-2xl font-black rounded-full uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 bg-white text-black hover:bg-zinc-200"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-8 h-8 mr-3 animate-spin text-fuchsia-500" /> Summoning...</>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-fuchsia-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <Dices className="w-8 h-8 mr-3 text-fuchsia-500 group-hover:-rotate-12 transition-transform duration-300" />
                                Release Chaos
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20 font-bold text-center">
                        {error}
                    </div>
                )}

                {/* The Reveal */}
                {result && !isGenerating && (
                    <div className="w-full flex flex-col gap-6 animate-in zoom-in-95 duration-700">
                        <div className="w-full rounded-[2rem] bg-zinc-900 border border-white/10 p-8 md:p-12 shadow-2xl relative flex flex-col gap-6 group">

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-fuchsia-400" />
                                    {result.chaos_level}
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {result.tags.map((tag, i) => (
                                        <Badge key={i} className="bg-white/5 text-zinc-300 hover:bg-white/10 border-white/10 px-3 py-1">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <p className="text-lg md:text-xl leading-relaxed text-zinc-300 font-medium font-serif italic selection:bg-cyan-500/30">
                                {result.prompt}
                            </p>

                            <div className="flex justify-end pt-4">
                                <Button
                                    size="lg"
                                    onClick={copyToClipboard}
                                    className={`rounded-2xl h-14 px-8 font-bold text-base transition-all ${copied ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {copied ? (
                                        <><Copy className="w-5 h-5 mr-2" /> Copied!</>
                                    ) : (
                                        <><Copy className="w-5 h-5 mr-2" /> Copy Prompt</>
                                    )}
                                </Button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
