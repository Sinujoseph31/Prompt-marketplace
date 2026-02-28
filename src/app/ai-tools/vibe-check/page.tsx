'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sparkles, Copy, Loader2, MoonStar, Wand2 } from 'lucide-react'

type VibeResponse = {
    vibe_reading: string;
    aura_colors: string;
    aesthetic_prompt: string;
}

export default function VibeCheckPage() {
    const [text, setText] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<VibeResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleReadVibe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) return;

        setIsGenerating(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/vibe-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to read vibe')
            }

            const data = await res.json()
            setResult(data.result)

            setTimeout(() => {
                document.getElementById('vibe-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsGenerating(false)
        }
    }

    const copyPrompt = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.aesthetic_prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-[#0A051A] text-slate-200 relative selection:bg-indigo-500/30 pb-20 overflow-hidden font-sans">

            {/* Ethereal Background Gradients */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-60"></div>
            <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-4xl px-5 pt-12 md:pt-20 flex flex-col gap-10 md:gap-14 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-5 py-2 bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)] tracking-widest text-xs font-semibold rounded-full backdrop-blur-md">
                        <MoonStar className="w-4 h-4 mr-2 text-indigo-400" />
                        Digital Oracle
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white drop-shadow-sm font-serif italic">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-purple-300">Aura</span> Reader
                    </h1>
                    <p className="text-indigo-200/60 text-lg md:text-xl font-light max-w-2xl px-4 leading-relaxed">
                        Whisper your thoughts, your mood, or your day to the algorithmic ether. It will return a reading of your energy and a beautiful prompt to visualize it.
                    </p>
                </div>

                {/* Input Area */}
                <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden backdrop-blur-xl group transition-all duration-500 hover:bg-white/[0.04] hover:border-indigo-500/20">
                    <form onSubmit={handleReadVibe} className="flex flex-col gap-4">
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="I'm feeling a bit restless, like a storm is coming..."
                            className="h-16 rounded-2xl bg-black/40 border-white/5 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/20 text-lg text-indigo-100 placeholder:text-indigo-300/30 px-6 font-light"
                        />
                        <Button
                            type="submit"
                            disabled={isGenerating || !text.trim()}
                            className="h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-lg w-full transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin text-indigo-200" /> Reading the signs...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-2 text-indigo-200" /> Consult the Oracle</>
                            )}
                        </Button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 font-medium text-center backdrop-blur-md">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && !isGenerating && (
                    <div id="vibe-results" className="w-full flex flex-col gap-8 animate-in slide-in-from-bottom-12 duration-1000 fade-in pt-4">

                        {/* The Reading Card */}
                        <div className="w-full rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8 md:p-12 shadow-2xl relative flex flex-col md:flex-row gap-10 md:gap-16 items-center backdrop-blur-2xl">

                            {/* Mystical Orb Decor */}
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full shrink-0 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="absolute inset-2 bg-gradient-to-br from-black to-slate-900 rounded-full"></div>
                                <MoonStar className="w-12 h-12 md:w-16 md:h-16 text-indigo-300 relative z-10 opacity-80" />
                            </div>

                            <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
                                <div>
                                    <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-indigo-400/80 mb-2">Detected Aura</h3>
                                    <p className="text-xl md:text-2xl font-serif text-white">{result.aura_colors}</p>
                                </div>

                                <div className="w-12 h-px bg-gradient-to-r from-indigo-500 to-transparent mx-auto md:mx-0"></div>

                                <div>
                                    <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-indigo-400/80 mb-3">The Reading</h3>
                                    <p className="text-lg md:text-xl leading-relaxed text-indigo-100/80 font-serif italic">
                                        "{result.vibe_reading}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Midjourney Prompt Generator Box */}
                        <div className="w-full max-w-3xl mx-auto rounded-3xl bg-black/40 border border-indigo-500/20 p-6 md:p-8 shadow-2xl flex flex-col gap-6 backdrop-blur-xl">

                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="bg-indigo-500/20 p-2 rounded-xl">
                                    <Wand2 className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="font-semibold text-indigo-100 text-lg">Your Aesthetic Visualization</h3>
                            </div>

                            <p className="font-mono text-sm md:text-base leading-relaxed text-indigo-200/90 selection:bg-indigo-500/40 font-light">
                                {result.aesthetic_prompt}
                            </p>

                            <Button
                                size="lg"
                                onClick={copyPrompt}
                                className={`w-full rounded-2xl h-14 font-medium transition-all duration-300 ${copied ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 hover:bg-white/10 text-indigo-200 border border-white/10'}`}
                            >
                                {copied ? (
                                    <><Copy className="w-5 h-5 mr-2" /> Captured in Clipboard</>
                                ) : (
                                    <><Copy className="w-5 h-5 mr-2" /> Copy Midjourney Prompt</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
