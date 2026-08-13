'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
    Video, 
    Sparkles, 
    Loader2, 
    Copy, 
    Check, 
    Music, 
    Zap, 
    Flame, 
    MessageSquare, 
    Heart, 
    Bookmark, 
    Share2, 
    Eye, 
    TrendingUp, 
    Play, 
    Film, 
    Layers, 
    Clock, 
    Lightbulb
} from 'lucide-react'

type HookItem = {
    type: string;
    voiceover: string;
    on_screen_text: string;
    visual_action: string;
}

type SceneItem = {
    scene_number: number;
    timestamp: string;
    voiceover: string;
    on_screen_text: string;
    visual_action: string;
    ai_video_prompt: string;
}

type ReelResponse = {
    title: string;
    hook_score: number;
    predicted_retention: string;
    hooks: HookItem[];
    audio_vibe: {
        genre: string;
        bpm: string;
        search_query: string;
    };
    scenes: SceneItem[];
    manychat_keyword: string;
    caption: string;
    hashtags: string[];
}

const PRESET_IDEAS = [
    { label: "🔥 Prompt Glow-Up (Before vs After)", topic: "Stop prompting like a beginner. Here is the 1-click prompt glow-up." },
    { label: "📸 $0 Product Photography", topic: "How to create luxury commercial product photos without hiring a photographer." },
    { label: "⚔️ Gemini vs Midjourney Battle", topic: "Who wins this insane AI prompt battle: Google Gemini or Midjourney?" },
    { label: "🧬 Reverse Engineering Secret Styles", topic: "How to steal any 3D claymation aesthetic and turn it into a prompt." },
    { label: "💰 Monetizing AI Prompts", topic: "How creators are making $5k/month selling prompt templates." },
]

const NICHES = ["Tech & AI", "Business & Money", "Design & Aesthetics", "E-commerce & Brands", "Creator Growth"]
const STYLES = ["Fast-Paced Hook (Alex Hormozi)", "Cinematic Visual Story", "Controversial Hot-Take", "Step-by-Step Tutorial"]
const DURATIONS = ["15s (Viral Hook)", "30s (Detailed)", "60s (Deep Dive)"]

export default function ReelArchitectPage() {
    const [topic, setTopic] = useState('')
    const [niche, setNiche] = useState('Tech & AI')
    const [style, setStyle] = useState('Fast-Paced Hook (Alex Hormozi)')
    const [duration, setDuration] = useState('15s (Viral Hook)')
    
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<ReelResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Active interactive preview states
    const [activeHookIndex, setActiveHookIndex] = useState(0)
    const [activeSceneIndex, setActiveSceneIndex] = useState(0)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!topic.trim()) return;

        setIsGenerating(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/reels-architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, niche, style, duration })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to generate reel blueprint')
            }

            const data = await res.json()
            setResult(data.result)
            setActiveHookIndex(0)
            setActiveSceneIndex(0)

            setTimeout(() => {
                document.getElementById('reel-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

    const copyFullScript = () => {
        if (!result) return;
        const scriptText = `🎬 REEL TITLE: ${result.title}
🔥 HOOK SCORE: ${result.hook_score}/100 | RETENTION: ${result.predicted_retention}
🎵 AUDIO: ${result.audio_vibe.genre} (${result.audio_vibe.bpm}) - Search: "${result.audio_vibe.search_query}"

---
HOOK (OPTION ${activeHookIndex + 1} - ${result.hooks[activeHookIndex]?.type}):
Voiceover: "${result.hooks[activeHookIndex]?.voiceover}"
On-Screen: "${result.hooks[activeHookIndex]?.on_screen_text}"
Action: ${result.hooks[activeHookIndex]?.visual_action}

---
STORYBOARD & SCENES:
${result.scenes.map(s => `[${s.timestamp}] Scene ${s.scene_number}:
Voiceover: "${s.voiceover}"
On-Screen: "${s.on_screen_text}"
Action: ${s.visual_action}
AI Video Prompt: ${s.ai_video_prompt}
`).join('\n')}

---
CAPTION:
${result.caption}

HASHTAGS:
${result.hashtags.join(' ')}
`
        copyToClipboard(scriptText, 'full-script')
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 relative selection:bg-rose-500/30 pb-28">
            {/* Background Ambient Glows */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="w-full max-w-5xl px-4 sm:px-6 pt-10 md:pt-16 flex flex-col gap-8 md:gap-12 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-amber-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30 shadow-sm uppercase tracking-widest text-xs font-bold gap-2">
                        <Video className="w-3.5 h-3.5" />
                        Viral Short-Form Engine
                    </Badge>
                    
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground drop-shadow-sm">
                        Reels <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">Architect</span>
                    </h1>
                    
                    <p className="text-muted-foreground text-base sm:text-lg md:text-xl font-medium max-w-2xl px-2">
                        Generate high-retention 3-second hooks, scene-by-scene storyboards, 9:16 AI video prompts (Midjourney/Runway/Luma), and viral captions designed to stop the scroll.
                    </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mr-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Presets:
                    </span>
                    {PRESET_IDEAS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setTopic(preset.topic)
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border/70 hover:border-rose-500/40 text-foreground/80 hover:text-foreground transition-all hover:scale-105 shadow-sm"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Studio Creator Card */}
                <div className="w-full rounded-3xl bg-card border border-border/60 shadow-xl p-6 sm:p-8 md:p-10 flex flex-col gap-6 backdrop-blur-sm relative overflow-hidden">
                    
                    {/* Topic Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold tracking-wide uppercase text-foreground/80 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-rose-500" /> Reel Topic / Core Idea
                        </label>
                        <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. 3 secret AI websites that feel illegal to know... or Before vs After prompt glow-up"
                            className="h-14 rounded-2xl bg-muted/40 border-2 border-border/60 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 text-base sm:text-lg px-5 shadow-inner"
                        />
                    </div>

                    {/* Configuration Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Niche */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Target Niche</label>
                            <select 
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                className="h-11 rounded-xl bg-muted/50 border border-border px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-foreground"
                            >
                                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        {/* Style / Pacing */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Pacing & Format</label>
                            <select 
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="h-11 rounded-xl bg-muted/50 border border-border px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-foreground"
                            >
                                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Duration</label>
                            <select 
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="h-11 rounded-xl bg-muted/50 border border-border px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-foreground"
                            >
                                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating || !topic.trim()}
                        className="h-14 mt-2 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 hover:opacity-95 text-white font-bold text-lg shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-98"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Crafting Viral Blueprint...</>
                        ) : (
                            <><Sparkles className="w-5 h-5 mr-2" /> Architect Viral Reel</>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20 font-bold text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && !isGenerating && (
                    <div id="reel-results" className="w-full flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                        
                        {/* Header Stats Bar */}
                        <div className="w-full rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase text-muted-foreground">Blueprint Title</span>
                                <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                                    <Film className="w-5 h-5 text-rose-500" /> {result.title}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4" />
                                    Hook Score: {result.hook_score}/100
                                </div>
                                <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    {result.predicted_retention}
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={copyFullScript}
                                    className="rounded-xl font-bold border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                                >
                                    {copiedKey === 'full-script' ? (
                                        <><Check className="w-4 h-4 mr-1.5 text-emerald-500" /> Script Copied!</>
                                    ) : (
                                        <><Copy className="w-4 h-4 mr-1.5" /> Copy Full Script</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Audio & Soundtrack Guidance */}
                        <div className="w-full rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                                    <Music className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">Recommended Audio Vibe</h4>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Genre: <span className="text-foreground font-semibold">{result.audio_vibe.genre}</span> • BPM: <span className="text-foreground font-semibold">{result.audio_vibe.bpm}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="bg-background/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border/80 text-xs font-mono text-muted-foreground flex items-center gap-2">
                                <span>Search Reels Audio:</span>
                                <span className="font-bold text-foreground">"{result.audio_vibe.search_query}"</span>
                            </div>
                        </div>

                        {/* Main Grid: Live Mockup Phone on Left + Storyboard & Hooks on Right */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* LEFT: 9:16 Instagram Reel Simulator Phone */}
                            <div className="lg:col-span-5 flex flex-col items-center gap-4 sticky top-24">
                                <div className="w-full max-w-[320px] aspect-[9/16] rounded-[2.5rem] bg-zinc-950 border-[6px] border-zinc-800 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden text-white select-none">
                                    
                                    {/* Phone Island / Speaker */}
                                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-900 rounded-full z-30" />

                                    {/* Background dynamic ambient scene art */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black z-0">
                                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
                                    </div>

                                    {/* Reel Top Bar */}
                                    <div className="relative z-20 flex justify-between items-center pt-5 px-2 text-xs font-semibold text-zinc-400">
                                        <span className="text-white font-bold flex items-center gap-1">
                                            <Play className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Reels
                                        </span>
                                        <span className="bg-zinc-800/80 px-2 py-0.5 rounded-full text-[10px] text-zinc-300 font-mono">
                                            {result.scenes[activeSceneIndex]?.timestamp || '00:00'}
                                        </span>
                                    </div>

                                    {/* Center: Dynamic On-Screen Captions / Visual Simulation */}
                                    <div className="relative z-20 flex flex-col items-center justify-center my-auto text-center px-4 gap-4">
                                        {/* Hook or Scene Subtitle */}
                                        <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl w-full">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 block mb-1">
                                                {activeSceneIndex === 0 ? `Hook (${result.hooks[activeHookIndex]?.type})` : `Scene ${activeSceneIndex + 1}`}
                                            </span>
                                            <h3 className="text-base sm:text-lg font-black uppercase text-yellow-300 tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                                "{activeSceneIndex === 0 ? result.hooks[activeHookIndex]?.on_screen_text : result.scenes[activeSceneIndex]?.on_screen_text}"
                                            </h3>
                                        </div>

                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-zinc-300 leading-snug w-full">
                                            <span className="font-bold text-zinc-400 block mb-0.5">🎬 Visual Action:</span>
                                            {activeSceneIndex === 0 ? result.hooks[activeHookIndex]?.visual_action : result.scenes[activeSceneIndex]?.visual_action}
                                        </div>
                                    </div>

                                    {/* Right Side Reel Action Bar (Like, Comment, Share) */}
                                    <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                                                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                                            </div>
                                            <span className="text-[10px] font-bold">42.8k</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold">1.4k</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                                                <Share2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold">8.9k</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                                                <Bookmark className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Creator Handle & Spoken Audio */}
                                    <div className="relative z-20 flex flex-col gap-2 pb-2 pr-12">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-[10px] font-black">
                                                AI
                                            </div>
                                            <span className="text-xs font-bold">@prompt.architect</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/20">Follow</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-200 line-clamp-2 leading-tight">
                                            🎙️ <span className="italic">"{activeSceneIndex === 0 ? result.hooks[activeHookIndex]?.voiceover : result.scenes[activeSceneIndex]?.voiceover}"</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Scrubber controls */}
                                <div className="flex items-center gap-1.5 bg-card border border-border p-1.5 rounded-full shadow-sm">
                                    <span className="text-[11px] font-bold text-muted-foreground px-2">Preview Scene:</span>
                                    {result.scenes.map((_, sIdx) => (
                                        <button
                                            key={sIdx}
                                            onClick={() => setActiveSceneIndex(sIdx)}
                                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${activeSceneIndex === sIdx ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                                        >
                                            {sIdx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT: Hooks & Scene Details */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                
                                {/* 3 Viral Hook Alternatives */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                                            <Flame className="w-5 h-5 text-rose-500" /> 3 Viral 3-Second Hooks
                                        </h3>
                                        <span className="text-xs text-muted-foreground">Select one to test</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {result.hooks.map((hook, hIdx) => (
                                            <div
                                                key={hIdx}
                                                onClick={() => {
                                                    setActiveHookIndex(hIdx)
                                                    setActiveSceneIndex(0)
                                                }}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${activeHookIndex === hIdx ? 'bg-rose-500/10 border-rose-500/60 shadow-md ring-1 ring-rose-500/30' : 'bg-card border-border/80 hover:border-rose-500/30'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-wider bg-background">
                                                        {hook.type}
                                                    </Badge>
                                                    {activeHookIndex === hIdx && (
                                                        <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                                            <Check className="w-3.5 h-3.5" /> Active in Preview
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    <span className="text-muted-foreground text-xs uppercase font-bold mr-1.5">Voiceover:</span>
                                                    "{hook.voiceover}"
                                                </p>
                                                <p className="text-xs font-mono bg-muted/60 p-2 rounded-lg text-foreground/90">
                                                    <span className="text-muted-foreground uppercase font-bold mr-1">On-Screen:</span>
                                                    {hook.on_screen_text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scene-by-Scene Storyboard & AI Video Prompts */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-purple-500" /> Scene Storyboard & AI Video Prompts
                                    </h3>

                                    <div className="flex flex-col gap-4">
                                        {result.scenes.map((scene, sIdx) => (
                                            <div 
                                                key={sIdx}
                                                className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col gap-4 relative"
                                            >
                                                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center">
                                                            {scene.scene_number}
                                                        </span>
                                                        <span className="font-bold text-sm text-foreground">Scene {scene.scene_number}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {scene.timestamp}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40">
                                                        <span className="font-bold text-muted-foreground uppercase">🎙️ Spoken Script</span>
                                                        <p className="font-medium text-foreground text-sm leading-relaxed">
                                                            "{scene.voiceover}"
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40">
                                                        <span className="font-bold text-muted-foreground uppercase">🎬 Visual Direction</span>
                                                        <p className="font-medium text-foreground text-sm leading-relaxed">
                                                            {scene.visual_action}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* AI Video / Midjourney Prompt */}
                                                <div className="flex flex-col gap-2 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                                            <Sparkles className="w-3.5 h-3.5" /> AI Video / Midjourney Prompt (--ar 9:16)
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(scene.ai_video_prompt, `scene-prompt-${sIdx}`)}
                                                            className="h-8 px-2.5 rounded-lg text-xs font-bold hover:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                                        >
                                                            {copiedKey === `scene-prompt-${sIdx}` ? (
                                                                <><Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied</>
                                                            ) : (
                                                                <><Copy className="w-3.5 h-3.5 mr-1" /> Copy Prompt</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <p className="font-mono text-xs text-muted-foreground leading-relaxed selection:bg-purple-500/20">
                                                        {scene.ai_video_prompt}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Caption & ManyChat Automation Hook */}
                                <div className="p-6 rounded-2xl bg-card border border-amber-500/30 shadow-md flex flex-col gap-4 mt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-amber-500" />
                                            <h3 className="text-lg font-black text-foreground">Instagram Caption & DM Trigger</h3>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                            Comment Keyword: "{result.manychat_keyword}"
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/50 border border-border font-sans text-sm whitespace-pre-line leading-relaxed text-foreground/90">
                                        {result.caption}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                        <div className="flex flex-wrap gap-1.5 max-w-lg">
                                            {result.hashtags.map((tag, tIdx) => (
                                                <span key={tIdx} className="text-xs font-medium text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => copyToClipboard(`${result.caption}\n\n${result.hashtags.join(' ')}`, 'caption')}
                                            className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white"
                                        >
                                            {copiedKey === 'caption' ? (
                                                <><Check className="w-4 h-4 mr-1.5" /> Caption Copied!</>
                                            ) : (
                                                <><Copy className="w-4 h-4 mr-1.5" /> Copy Full Caption</>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}
