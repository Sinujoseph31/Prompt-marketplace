'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Flame, Copy, Loader2, Sparkles, AlertTriangle } from 'lucide-react'

export default function RoastMyPromptPage() {
    const [promptText, setPromptText] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<{ roast_score: number, savage_roast: string, god_tier_prompt: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleRoast = async () => {
        if (!promptText.trim()) return;

        setIsGenerating(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/roast-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: promptText })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to roast prompt')
            }

            const data = await res.json()
            setResult(data.result)

            setTimeout(() => {
                document.getElementById('roast-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.god_tier_prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-background relative selection:bg-orange-500/30 pb-20">
            <div className="w-full max-w-4xl px-5 pt-12 md:pt-20 flex flex-col gap-8 md:gap-12">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="destructive" className="px-4 py-1.5 bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-sm uppercase tracking-widest text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 mr-2 animate-pulse" />
                        AI Critical Analysis
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-orange-600/50">
                        Roast My Prompt
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl px-4">
                        Think your prompt is good? Our AI is here to ruthlessly tear it apart and then rewrite it the way a professional would.
                    </p>
                </div>

                {/* Input Area */}
                <div className="w-full rounded-[2rem] bg-card border-2 border-border shadow-xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mt-20 -mr-20 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>

                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold">Submit Your Prompt for Judgment</h3>
                    </div>

                    <Textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Paste your boring 'a cute dog in a park 4k' prompt here..."
                        className="min-h-[160px] resize-none text-base md:text-lg p-6 rounded-2xl border-2 border-muted bg-background focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors shadow-inner"
                    />

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleRoast}
                            disabled={isGenerating || !promptText.trim()}
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-14 px-8 text-base font-bold shadow-lg shadow-orange-600/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Mediocrity...</>
                            ) : (
                                <><Flame className="w-5 h-5 mr-2" /> Ignite the Roast</>
                            )}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20 font-bold text-center">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {result && !isGenerating && (
                    <div id="roast-results" className="w-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 mt-4">

                        {/* The Roast Panel */}
                        <div className="flex-1 rounded-[2rem] bg-zinc-950 text-white p-8 md:p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/10 flex flex-col gap-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-50 blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center text-center gap-2 border-b border-white/10 pb-8">
                                <span className="text-sm font-bold text-red-400 tracking-widest uppercase">Basic-ness Score</span>
                                <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-red-400 to-red-800 drop-shadow-lg">
                                    {result.roast_score}/10
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-xl md:text-2xl font-bold leading-relaxed text-red-50 italic">
                                    "{result.savage_roast}"
                                </p>
                            </div>
                        </div>

                        {/* The God-Tier Panel */}
                        <div className="flex-[1.5] rounded-[2rem] bg-card border-2 border-primary/20 p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none"></div>

                            <div className="relative z-10 flex-1 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 text-primary p-2 rounded-xl">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black">The God-Tier Edit</h3>
                                </div>

                                <p className="flex-1 bg-muted/50 rounded-2xl p-6 font-mono text-sm md:text-base leading-relaxed text-foreground/90 border border-border shadow-inner selection:bg-primary/30">
                                    {result.god_tier_prompt}
                                </p>

                                <Button
                                    size="lg"
                                    onClick={copyToClipboard}
                                    className={`w-full rounded-2xl h-14 font-bold text-base transition-all ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                                >
                                    {copied ? (
                                        <><Copy className="w-5 h-5 mr-2" /> Claimed!</>
                                    ) : (
                                        <><Copy className="w-5 h-5 mr-2" /> Steal This Prompt</>
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
