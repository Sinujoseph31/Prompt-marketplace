'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    Sparkles,
    UploadCloud,
    Copy,
    Check,
    Loader2,
    Fingerprint,
    UserCheck,
    Camera,
    Coffee,
    Zap,
    Sun,
    Palette,
    Gamepad2,
    Layers,
    X,
    RefreshCw,
    AlertCircle,
    Download,
    CheckCircle2,
    Edit3,
    Dumbbell,
    Briefcase,
    Glasses,
    Rocket,
    Shield,
    Plane,
    Mic,
    Snowflake,
    User,
    Activity,
    Film
} from 'lucide-react'

const PRESET_SCENES = [
    { id: 'studio', label: 'Studio Headshot', icon: Camera, desc: 'Clean 85mm portrait, neutral backdrop' },
    { id: 'coffee', label: 'Cozy Coffee Shop', icon: Coffee, desc: 'Warm ambient lighting, ceramic mug' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Zap, desc: 'Rainy futuristic streets, neon reflections' },
    { id: 'outdoor', label: 'Golden Hour Sun', icon: Sun, desc: 'Natural sunlight, cinematic lens flare' },
    { id: 'fitness', label: 'Fitness & Gym', icon: Dumbbell, desc: 'Athletic wear, dramatic workout lighting' },
    { id: 'office', label: 'Tech Startup Office', icon: Briefcase, desc: 'Modern glass office, corporate casual' },
    { id: 'polaroid', label: '90s Vintage Polaroid', icon: Film, desc: 'Nostalgic grainy direct-flash film' },
    { id: 'space', label: 'Sci-Fi Space Station', icon: Rocket, desc: 'Astronaut suit, nebula observation deck' },
    { id: 'fantasy', label: 'Medieval Knight', icon: Shield, desc: 'Ornate armor, misty castle ruins' },
    { id: 'travel', label: 'Luxury Travel & Jet', icon: Plane, desc: 'First-class lounge, travel luggage' },
    { id: 'podcast', label: 'Podcast / Creator', icon: Mic, desc: 'Studio mic, acoustic foam & RGB glow' },
    { id: 'winter', label: 'Winter Snow Resort', icon: Snowflake, desc: 'Puffer coat, falling alpine snow' },
    { id: 'editorial', label: 'High Fashion', icon: Layers, desc: 'Dramatic haute couture magazine cover' },
    { id: 'anime', label: '2D Anime / Ghibli', icon: Palette, desc: 'Hand-drawn anime, identical proportions' },
    { id: 'action', label: '3D Action Hero', icon: Gamepad2, desc: 'Tactical cinematic still, atmospheric dust' },
]

const SAMPLE_CHARACTERS = [
    "A 27-year-old Scandinavian architect with deep emerald eyes, faint bridge freckles, structured jawline, and honey-blonde wavy hair tied in a loose bun.",
    "A 32-year-old Japanese-American digital creator with sharp jawline, warm brown monolid eyes, subtle stubble, and messy jet-black textured hair.",
    "A 24-year-old Brazilian photographer with warm bronze skin, hazel-amber eyes, defined cheekbones, and dark curly hair falling over forehead."
]

type CharacterSubMetrics = {
    image_clarity?: number;
    face_match?: number;
    body_proportions?: number;
    lighting_fidelity?: number;
}

type CharacterDNA = {
    title: string;
    estimated_age: string;
    gender: string;
    key_facial_signatures: string[];
    body_physique_signatures?: string[];
    sub_metrics?: CharacterSubMetrics;
    full_identity_anchor: string;
}

type SceneResult = {
    id: string;
    title: string;
    chatgpt_prompt: string;
    gemini_prompt: string;
    midjourney_prompt: string;
}

type StudioResult = {
    character_dna: CharacterDNA;
    scenes: SceneResult[];
    consistency_guide: {
        chatgpt: string;
        gemini: string;
    };
}

export default function CharacterStudioPage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [characterDescription, setCharacterDescription] = useState('')
    const [selectedScenes, setSelectedScenes] = useState<string[]>(['studio', 'coffee', 'cyberpunk', 'outdoor'])
    const [customSceneText, setCustomSceneText] = useState('')

    // Active Model Tab
    const [activeTab, setActiveTab] = useState<'chatgpt' | 'gemini' | 'midjourney'>('chatgpt')

    // State
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<StudioResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            setError("Please upload a valid image file (JPEG, PNG, WEBP).")
            return
        }
        if (selectedFile.size > 20 * 1024 * 1024) {
            setError("Image size must be under 20MB.")
            return
        }
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setError(null)
    }, [])

    const toggleScene = (sceneId: string) => {
        setSelectedScenes(prev =>
            prev.includes(sceneId)
                ? prev.filter(id => id !== sceneId)
                : [...prev, sceneId]
        )
    }

    const handleGenerate = async () => {
        if (!file && !characterDescription.trim()) {
            setError("Please upload an image or enter a character description.")
            return
        }

        if (selectedScenes.length === 0 && !customSceneText.trim()) {
            setError("Please select at least one scene to generate.")
            return
        }

        setIsGenerating(true)
        setError(null)
        setResult(null)

        const formData = new FormData()
        if (file) formData.append('image', file)
        if (characterDescription.trim()) formData.append('character_description', characterDescription)
        formData.append('scenes', JSON.stringify(selectedScenes))
        if (customSceneText.trim()) formData.append('custom_scene', customSceneText.trim())

        try {
            const res = await fetch('/api/character-studio', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorText = await res.text()
                let errorMsg = 'Failed to generate character scenes.'
                try {
                    const parsed = JSON.parse(errorText)
                    errorMsg = parsed.error || errorMsg
                } catch {
                    errorMsg = errorText
                }
                throw new Error(errorMsg)
            }

            const data = await res.json()
            setResult(data.result)

            setTimeout(() => {
                document.getElementById('studio-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while generating character scenes.")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string, key: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const copyAllBundle = () => {
        if (!result) return
        const modelName = activeTab === 'chatgpt' ? 'ChatGPT (GPT-4o / DALL-E 3)' : activeTab === 'gemini' ? 'Google Gemini (Imagen 3)' : 'Midjourney v6.1'

        let bundleMarkdown = `# ${result.character_dna.title} - Consistent Character Storyboard Bundle\n`
        bundleMarkdown += `Target Engine: ${modelName}\n\n`
        bundleMarkdown += `## Biometric Identity Anchor\n${result.character_dna.full_identity_anchor}\n\n`
        bundleMarkdown += `### Extracted Facial Signatures:\n`
        result.character_dna.key_facial_signatures.forEach(sig => {
            bundleMarkdown += `- ${sig}\n`
        })
        bundleMarkdown += `\n---\n\n`

        result.scenes.forEach((scene, index) => {
            const prompt = activeTab === 'chatgpt' ? scene.chatgpt_prompt : activeTab === 'gemini' ? scene.gemini_prompt : scene.midjourney_prompt
            bundleMarkdown += `### Scene ${index + 1}: ${scene.title}\n`
            bundleMarkdown += `\`\`\`\n${prompt}\n\`\`\`\n\n`
        })

        copyToClipboard(bundleMarkdown, 'bundle')
    }

    const resetAll = () => {
        setFile(null)
        setPreviewUrl(null)
        setCharacterDescription('')
        setResult(null)
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-slate-200 relative selection:bg-emerald-500/30 pb-24 font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-900/15 rounded-full blur-[130px] pointer-events-none"></div>

            <div className="w-full max-w-6xl px-4 sm:px-6 pt-12 md:pt-16 flex flex-col gap-10 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] tracking-widest text-xs font-mono rounded-md backdrop-blur-md uppercase">
                        <Fingerprint className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
                        AI Character & Avatar Studio
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase text-center">
                        Consistent Character Studio
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl px-4 leading-relaxed font-mono">
                        Generate synchronized multi-scene prompts for the same character in <span className="text-emerald-400 font-semibold">ChatGPT</span> & <span className="text-blue-400 font-semibold">Gemini</span> with zero face drift.
                    </p>
                </div>

                {/* Main Configuration Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Input Settings (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col gap-6">

                            {/* Section 1: Character Input Mode */}
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4" />
                                    1. Character Reference Source
                                </span>

                                {/* Upload Area */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        setIsDragging(false)
                                        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
                                    }}
                                    onClick={!previewUrl ? () => fileInputRef.current?.click() : undefined}
                                    className={`
                                        w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-all duration-300
                                        ${previewUrl ? 'border-zinc-700 bg-zinc-950' :
                                            isDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-950 hover:border-zinc-700 cursor-pointer'}
                                    `}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                    />

                                    {previewUrl ? (
                                        <div className="absolute inset-0 w-full h-full group flex items-center justify-center p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={previewUrl} alt="Character Preview" className="w-full h-full object-contain rounded-lg" />
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setFile(null)
                                                    setPreviewUrl(null)
                                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                                }}
                                                className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full bg-zinc-900/80 hover:bg-red-600 text-zinc-300 border border-zinc-700 shadow-md"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                                            <UploadCloud className="w-8 h-8 text-zinc-600 mb-2" />
                                            <span className="text-xs font-mono font-bold text-zinc-300 uppercase">Upload Reference Photo</span>
                                            <span className="text-[11px] text-zinc-500 mt-1">PNG, JPG up to 20MB</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text Description Alternative */}
                                <div className="flex flex-col gap-1.5 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Or describe character:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const sample = SAMPLE_CHARACTERS[Math.floor(Math.random() * SAMPLE_CHARACTERS.length)]
                                                setCharacterDescription(sample)
                                            }}
                                            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                        >
                                            <Sparkles className="w-3 h-3" /> Sample
                                        </button>
                                    </div>
                                    <Textarea
                                        value={characterDescription}
                                        onChange={(e) => setCharacterDescription(e.target.value)}
                                        placeholder="E.g., 28-year-old woman with hazel eyes, sharp cheekbones, wavy chestnut hair, faint freckles..."
                                        rows={3}
                                        className="bg-zinc-950 border-zinc-800 text-xs font-mono placeholder:text-zinc-600 resize-none rounded-xl focus-visible:ring-emerald-500/50"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Multi-Scene Selector */}
                            <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/80">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Camera className="w-4 h-4" />
                                        2. Select Storyboard Scenes
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedScenes(PRESET_SCENES.map(s => s.id))}
                                            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-zinc-600 text-[10px]">•</span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedScenes([])}
                                            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-400 transition-colors"
                                        >
                                            Clear
                                        </button>
                                        <span className="text-[11px] font-mono text-zinc-400 ml-1">
                                            ({selectedScenes.length} active)
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                                    {PRESET_SCENES.map((scene) => {
                                        const isSelected = selectedScenes.includes(scene.id)
                                        const Icon = scene.icon
                                        return (
                                            <button
                                                key={scene.id}
                                                type="button"
                                                onClick={() => toggleScene(scene.id)}
                                                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm'
                                                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-950'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-500'}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold font-mono truncate">{scene.label}</span>
                                                    <span className="text-[10px] text-zinc-500 leading-tight truncate">{scene.desc}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Custom Scene Builder */}
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                        <Edit3 className="w-3 h-3 text-emerald-400" /> Custom Scene Cue (Optional):
                                    </span>
                                    <Input
                                        value={customSceneText}
                                        onChange={(e) => setCustomSceneText(e.target.value)}
                                        placeholder="E.g., Walking through snowy mountains in winter coat..."
                                        className="bg-zinc-950 border-zinc-800 text-xs font-mono h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-950/30 text-red-400 text-xs rounded-xl border border-red-900/50 flex items-center gap-2.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                {(previewUrl || characterDescription) && (
                                    <Button
                                        variant="outline"
                                        onClick={resetAll}
                                        className="h-12 px-4 rounded-xl border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || (!file && !characterDescription.trim())}
                                    className="h-12 flex-1 font-bold font-mono uppercase tracking-wider rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Synthesizing DNA...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Generate Storyboard Prompts
                                        </span>
                                    )}
                                </Button>
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Output & Storyboard (7 cols) */}
                    <div id="studio-results" className="lg:col-span-7 flex flex-col gap-6 min-h-[500px]">
                        {!result && !isGenerating ? (
                            <div className="w-full h-full min-h-[450px] rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center p-10 text-center text-zinc-600">
                                <Fingerprint className="w-16 h-16 mb-4 opacity-40 text-emerald-500 animate-pulse" />
                                <h3 className="text-xl font-bold mb-2 font-mono uppercase text-zinc-400">Awaiting Character Input</h3>
                                <p className="text-sm leading-relaxed max-w-sm text-zinc-500">
                                    Upload a portrait photo or describe a character on the left. The studio will extract facial DNA and generate multi-scene prompts locked for ChatGPT & Gemini.
                                </p>
                            </div>
                        ) : isGenerating ? (
                            <div className="w-full h-full min-h-[450px] rounded-2xl border border-emerald-500/30 bg-zinc-900/40 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-px bg-emerald-500 shadow-[0_0_15px_#10B981] animate-scan"></div>
                                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
                                <h3 className="text-lg font-bold font-mono uppercase text-emerald-400 tracking-wider">
                                    Locking Facial Biometrics
                                </h3>
                                <p className="text-xs text-zinc-400 font-mono mt-2 max-w-xs">
                                    Calibrating landmarks, skin tone fidelity, and scene lighting parameters for ChatGPT & Gemini...
                                </p>
                            </div>
                        ) : result ? (
                            <div className="w-full flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 fade-in">

                                {/* Top Character Biometric DNA Banner */}
                                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)] flex flex-col gap-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                                <Fingerprint className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                                                    {result.character_dna.title}
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                        LOCKED
                                                    </span>
                                                </h3>
                                                <span className="text-xs text-zinc-400 font-mono">
                                                    {result.character_dna.gender} • {result.character_dna.estimated_age}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={copyAllBundle}
                                            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold font-mono text-xs shadow-md"
                                        >
                                            {copiedKey === 'bundle' ? (
                                                <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied Full Storyboard</>
                                            ) : (
                                                <><Download className="w-3.5 h-3.5 mr-1.5" /> Export All Prompts Bundle</>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Sub-Metrics Row */}
                                    {result.character_dna.sub_metrics && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                                            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1">
                                                <div className="flex justify-between text-[11px] font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1"><Camera className="w-3 h-3 text-cyan-400" /> Clarity</span>
                                                    <span className="text-cyan-300 font-bold">{result.character_dna.sub_metrics.image_clarity || 92}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${result.character_dna.sub_metrics.image_clarity || 92}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1">
                                                <div className="flex justify-between text-[11px] font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1"><UserCheck className="w-3 h-3 text-emerald-400" /> Face</span>
                                                    <span className="text-emerald-300 font-bold">{result.character_dna.sub_metrics.face_match || 95}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${result.character_dna.sub_metrics.face_match || 95}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1">
                                                <div className="flex justify-between text-[11px] font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1"><User className="w-3 h-3 text-purple-400" /> Body</span>
                                                    <span className="text-purple-300 font-bold">{result.character_dna.sub_metrics.body_proportions || 90}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${result.character_dna.sub_metrics.body_proportions || 90}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1">
                                                <div className="flex justify-between text-[11px] font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-400" /> Light</span>
                                                    <span className="text-yellow-300 font-bold">{result.character_dna.sub_metrics.lighting_fidelity || 92}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${result.character_dna.sub_metrics.lighting_fidelity || 92}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Facial Landmarks Tags */}
                                    <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
                                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                            Preserved Facial Signatures:
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {result.character_dna.key_facial_signatures.map((sig, idx) => (
                                                <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-start gap-2">
                                                    <span className="text-emerald-400 font-bold">•</span>
                                                    <span className="leading-tight">{sig}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Body & Silhouette Signatures */}
                                    {result.character_dna.body_physique_signatures && result.character_dna.body_physique_signatures.length > 0 && (
                                        <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
                                            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-purple-400" />
                                                Preserved Body & Physique Signatures:
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {result.character_dna.body_physique_signatures.map((sig, idx) => (
                                                    <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-start gap-2">
                                                        <span className="text-purple-400 font-bold">•</span>
                                                        <span className="leading-tight">{sig}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Target Model Selector Tabs */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                            Active Target Model Format:
                                        </span>
                                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            {activeTab === 'chatgpt' ? 'ChatGPT (GPT-4o / DALL-E 3)' : activeTab === 'gemini' ? 'Google Gemini (Imagen 3)' : 'Midjourney v6.1'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('chatgpt')}
                                            className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                activeTab === 'chatgpt'
                                                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            ChatGPT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('gemini')}
                                            className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                activeTab === 'gemini'
                                                    ? 'bg-blue-500 text-zinc-950 shadow-md shadow-blue-500/20'
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Gemini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('midjourney')}
                                            className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                activeTab === 'midjourney'
                                                    ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            Midjourney
                                        </button>
                                    </div>
                                </div>

                                {/* Generated Storyboard Scenes */}
                                <div className="flex flex-col gap-4">
                                    {result.scenes.map((scene, idx) => {
                                        const prompt = activeTab === 'chatgpt' ? scene.chatgpt_prompt : activeTab === 'gemini' ? scene.gemini_prompt : scene.midjourney_prompt
                                        const isCopied = copiedKey === `scene-${idx}`

                                        return (
                                            <div
                                                key={scene.id || idx}
                                                className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-3 relative group"
                                            >
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono text-emerald-400">
                                                            {idx + 1}
                                                        </span>
                                                        {scene.title}
                                                    </span>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => copyToClipboard(prompt, `scene-${idx}`)}
                                                        className={`h-8 text-xs font-mono transition-all ${
                                                            isCopied
                                                                ? 'bg-emerald-500 text-zinc-950'
                                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                                                        }`}
                                                    >
                                                        {isCopied ? (
                                                            <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied</>
                                                        ) : (
                                                            <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Scene Prompt</>
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 font-serif text-sm sm:text-base leading-relaxed selection:bg-emerald-500/30">
                                                    {prompt}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Face Consistency Protocol Guide for the Active Model */}
                                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                                    <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        How to execute in {activeTab === 'chatgpt' ? 'ChatGPT (GPT-4o)' : activeTab === 'gemini' ? 'Google Gemini (Imagen 3)' : 'Midjourney'}:
                                    </span>
                                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                        {activeTab === 'chatgpt'
                                            ? result.consistency_guide?.chatgpt || "1. Upload your character's reference image into ChatGPT.\n2. Paste any of the scene prompts above.\n3. Instruct ChatGPT: 'Ensure the subject's face is 100% identical to the attached reference photo.'"
                                            : activeTab === 'gemini'
                                            ? result.consistency_guide?.gemini || "1. Open Gemini with image generation enabled.\n2. Attach the character photo and use the Gemini prompt to generate photorealistic images with exact facial landmark retention."
                                            : "In Midjourney, replace [IMAGE_URL] in the prompt with the public Discord URL of your character reference photo and keep --cw 100 for maximum face weight."}
                                    </p>
                                </div>

                            </div>
                        ) : null}
                    </div>

                </div>

            </div>
        </div>
    )
}
