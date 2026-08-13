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
    ShoppingBag,
    Package,
    Droplets,
    Sun,
    Zap,
    Coffee,
    Camera,
    Snowflake,
    Flame,
    Layers,
    X,
    RefreshCw,
    AlertCircle,
    Download,
    CheckCircle2,
    Edit3,
    Palmtree,
    Lightbulb,
    Crop as CropIcon
} from 'lucide-react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

const COMMERCIAL_SCENES = [
    { id: 'marble_gold', label: 'Luxury Marble & Gold', icon: Sparkles, desc: 'Polished white Carrara marble, gold accents, soft rim lighting' },
    { id: 'water_splash', label: 'Water Splash & Dew', icon: Droplets, desc: 'Dynamic crystal water splash, floating dewdrops, caustic refractions' },
    { id: 'botanical', label: 'Organic Botanical', icon: Layers, desc: 'Natural slate stone, sun-dappled monstera leaf shadows' },
    { id: 'tropical_sand', label: 'Tropical Golden Sand', icon: Palmtree, desc: 'Warm sea-salt sand, turquoise ocean ripples, sunlit palm shade' },
    { id: 'cyberpunk_neon', label: 'Cyberpunk Neon Street', icon: Zap, desc: 'Rain-slicked asphalt, glowing magenta & cyan reflections, moody haze' },
    { id: 'artisan_cafe', label: 'Artisan Wooden Cafe', icon: Coffee, desc: 'Rich walnut tabletop, warm morning ambient light, cozy depth' },
    { id: 'studio_podium', label: 'Clean Studio Podium', icon: Camera, desc: 'Geometric cylindrical pedestal, neutral grey gradient, softbox lighting' },
    { id: 'arctic_ice', label: 'Frosted Arctic Ice', icon: Snowflake, desc: 'Crystal clear ice blocks, frozen mist, crisp blue backlighting' },
    { id: 'particle_burst', label: 'Dynamic Particle Burst', icon: Flame, desc: 'Kinetic floating particles, high-speed shutter, dramatic studio flare' },
    { id: 'pastel_clouds', label: 'Soft Pastel Clouds', icon: Package, desc: 'Dreamy cotton clouds, iridescent pastel glow, ethereal soft lighting' },
    { id: 'dark_luxe', label: 'Dark Luxe Chiaroscuro', icon: ShoppingBag, desc: 'Matte black obsidian podium, razor-sharp edge lighting, luxury mood' }
]

const SAMPLE_PRODUCTS = [
    "A luxury 50ml frosted amber glass bottle of Vitamin C Face Serum with a matte black dropper cap, metallic gold rim, and minimalist white serif label.",
    "A sleek 330ml slim aluminum matte-black can of Nitro Cold Brew Coffee with embossed gold geometric typography and chilled condensation beads.",
    "A premium 100ml heavy square crystal perfume bottle with dark amber whiskey-toned fragrance, brushed brass cap, and embossed leather label.",
    "A futuristic cyberpunk high-top running sneaker with translucent neon sole, breathable grey mesh knit, and holographic accents."
]

type ProductDNA = {
    product_name: string;
    category: string;
    materials_texture: string;
    key_packaging_features: string[];
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
    product_dna: ProductDNA;
    scenes: SceneResult[];
    ad_strategy_tip?: string;
}

export default function ProductStudioPage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [inputMode, setInputMode] = useState<'image' | 'text'>('image')
    const [productDescription, setProductDescription] = useState('')
    const [selectedScenes, setSelectedScenes] = useState<string[]>([
        'marble_gold',
        'water_splash',
        'studio_podium',
        'dark_luxe'
    ])
    const [customSceneText, setCustomSceneText] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<StudioResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'chatgpt' | 'gemini' | 'midjourney'>('chatgpt')
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    // Cropping State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            setError("Please upload a valid image file (JPEG, PNG, WEBP).")
            return
        }

        if (selectedFile.size > 20 * 1024 * 1024) {
            setError("Image size must be less than 20MB.")
            return
        }

        setError(null)
        setFile(selectedFile)
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
        setResult(null)
    }, [])

    const toggleScene = (sceneId: string) => {
        if (selectedScenes.includes(sceneId)) {
            setSelectedScenes(selectedScenes.filter(id => id !== sceneId))
        } else {
            setSelectedScenes([...selectedScenes, sceneId])
        }
    }

    const selectAllScenes = () => {
        setSelectedScenes(COMMERCIAL_SCENES.map(s => s.id))
    }

    const clearAllScenes = () => {
        setSelectedScenes([])
    }

    const handleGenerate = async () => {
        if (inputMode === 'image' && !file) {
            setError("Please upload a product photo to begin.")
            return
        }
        if (inputMode === 'text' && !productDescription.trim()) {
            setError("Please describe the product you want to photograph.")
            return
        }
        if (selectedScenes.length === 0 && !customSceneText.trim()) {
            setError("Please select at least one commercial advertising scene.")
            return
        }

        setIsGenerating(true)
        setError(null)
        setResult(null)

        const scenesPayload = COMMERCIAL_SCENES
            .filter(s => selectedScenes.includes(s.id))
            .map(s => ({
                id: s.id,
                title: s.label,
                prompt_cue: s.desc
            }))

        const formData = new FormData()
        if (inputMode === 'image' && file) {
            formData.append('image', file)
        }
        formData.append('productDescription', productDescription.trim())
        formData.append('scenes', JSON.stringify(scenesPayload))
        formData.append('customScene', customSceneText.trim())

        try {
            const res = await fetch('/api/product-studio', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorText = await res.text()
                let errorMsg = 'Failed to generate commercial prompts.'
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
            setError(err.message || "An unexpected error occurred.")
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
        const header = `# Commercial Ad Campaign: ${result.product_dna.product_name}\n\n**Category:** ${result.product_dna.category}\n**Product Packaging DNA:** ${result.product_dna.full_identity_anchor}\n\n---\n\n`
        const body = result.scenes.map((s, i) => {
            const prompt = activeTab === 'chatgpt' ? s.chatgpt_prompt : activeTab === 'gemini' ? s.gemini_prompt : s.midjourney_prompt
            return `## Scene ${i + 1}: ${s.title} (${activeTab.toUpperCase()})\n\n${prompt}\n\n`
        }).join('---\n\n')

        copyToClipboard(header + body, 'bundle')
    }

    // Image Crop Handlers
    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height))
    }

    const applyCrop = async () => {
        if (!completedCrop || !imgRef.current) return
        const image = imgRef.current
        const canvas = document.createElement('canvas')
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        canvas.width = completedCrop.width * scaleX
        canvas.height = completedCrop.height * scaleY
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        )

        canvas.toBlob((blob) => {
            if (!blob) return
            const croppedFile = new File([blob], file?.name || 'cropped_product.png', { type: blob.type })
            setFile(croppedFile)
            setPreviewUrl(URL.createObjectURL(croppedFile))
            setCropModalOpen(false)
        }, 'image/png')
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-slate-200 relative selection:bg-amber-500/30 pb-24 font-sans">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-900/15 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-6xl px-4 sm:px-6 pt-12 md:pt-16 flex flex-col gap-10 relative z-10">

                {/* Hero Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] tracking-widest text-xs font-mono rounded-md backdrop-blur-md uppercase">
                        <ShoppingBag className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
                        AI Commercial Ad & Photography Studio
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase text-center">
                        Product Studio
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl px-4 leading-relaxed font-mono">
                        Transform raw product photos into luxury, high-converting commercial ad campaigns in <span className="text-emerald-400 font-semibold">ChatGPT</span> & <span className="text-cyan-400 font-semibold">Gemini</span>.
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Product Input & Scene Controls (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col gap-6">

                            {/* Section 1: Product Input Switcher */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Package className="w-4 h-4" />
                                        1. Product Source
                                    </span>
                                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('image')}
                                            className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-all ${
                                                inputMode === 'image'
                                                    ? 'bg-amber-400 text-zinc-950 shadow-sm shadow-amber-400/20'
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            Photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('text')}
                                            className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-all ${
                                                inputMode === 'text'
                                                    ? 'bg-amber-400 text-zinc-950 shadow-sm shadow-amber-400/20'
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            Text
                                        </button>
                                    </div>
                                </div>

                                {inputMode === 'image' ? (
                                    <div className="flex flex-col gap-3">
                                        {!previewUrl ? (
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                                                    isDragging ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                                                }`}
                                            >
                                                <UploadCloud className="w-10 h-10 text-amber-400" />
                                                <div className="text-center">
                                                    <p className="text-xs font-bold font-mono text-zinc-300">Click to upload or drag product photo</p>
                                                    <p className="text-[11px] text-zinc-500 font-mono mt-1">PNG, JPG, WEBP up to 20MB</p>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center p-3 gap-3">
                                                <img src={previewUrl} alt="Product Preview" className="max-h-48 rounded-lg object-contain" />
                                                <div className="flex gap-2 w-full">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setCropModalOpen(true)}
                                                        className="flex-1 font-mono text-xs border-zinc-700 bg-zinc-900 text-zinc-300"
                                                    >
                                                        <CropIcon className="w-3.5 h-3.5 mr-1" /> Crop
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                                                        className="flex-1 font-mono text-xs border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-red-400"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Change
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Textarea
                                            value={productDescription}
                                            onChange={(e) => setProductDescription(e.target.value)}
                                            placeholder="Describe your product packaging, materials, bottle shape, colors, and label details..."
                                            rows={4}
                                            className="bg-zinc-950 border-zinc-800 text-sm font-mono placeholder:text-zinc-600 resize-none rounded-xl"
                                        />
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <span className="text-[10px] font-mono text-zinc-500">Sample Products:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {SAMPLE_PRODUCTS.map((s, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setProductDescription(s)}
                                                        className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                                                    >
                                                        Sample {idx + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Commercial Backdrops Grid */}
                            <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Camera className="w-4 h-4" />
                                        2. Commercial Environments ({selectedScenes.length})
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                        <button type="button" onClick={selectAllScenes} className="text-amber-400 hover:underline">Select All</button>
                                        <span className="text-zinc-600">•</span>
                                        <button type="button" onClick={clearAllScenes} className="text-zinc-500 hover:underline">Clear</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {COMMERCIAL_SCENES.map((scene) => {
                                        const isSelected = selectedScenes.includes(scene.id)
                                        const IconComponent = scene.icon
                                        return (
                                            <button
                                                key={scene.id}
                                                type="button"
                                                onClick={() => toggleScene(scene.id)}
                                                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                                    isSelected
                                                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                                                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-500'}`}>
                                                    <IconComponent className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-xs font-mono leading-snug">{scene.label}</span>
                                                    <span className="text-[10px] text-zinc-500 truncate">{scene.desc}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Custom Scene Cue */}
                                <div className="flex flex-col gap-1.5 pt-1">
                                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                                        <Edit3 className="w-3 h-3 text-amber-400" /> Custom Environment Cue (Optional):
                                    </span>
                                    <Input
                                        value={customSceneText}
                                        onChange={(e) => setCustomSceneText(e.target.value)}
                                        placeholder="e.g. Floating in zero gravity with neon purple nebula dust..."
                                        className="bg-zinc-950 border-zinc-800 text-xs font-mono rounded-xl h-9"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-950/30 text-red-400 text-xs rounded-xl border border-red-900/50 flex items-center gap-2.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || (inputMode === 'image' ? !file : !productDescription.trim())}
                                className="h-12 font-bold font-mono uppercase tracking-wider rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Rendering Ad Studio...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Generate Commercial Prompts
                                    </span>
                                )}
                            </Button>

                        </div>
                    </div>

                    {/* Right Column: Generated Commercial Ad Prompts (7 cols) */}
                    <div id="studio-results" className="lg:col-span-7 flex flex-col gap-6 min-h-[500px]">
                        {!result && !isGenerating ? (
                            <div className="w-full h-full min-h-[450px] rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center p-10 text-center text-zinc-600">
                                <ShoppingBag className="w-16 h-16 mb-4 opacity-40 text-amber-500 animate-pulse" />
                                <h3 className="text-xl font-bold mb-2 font-mono uppercase text-zinc-400">Commercial Studio Standby</h3>
                                <p className="text-sm leading-relaxed max-w-sm text-zinc-500">
                                    Upload a product photo or describe it on the left. The studio will extract packaging materials and craft high-converting ad prompts for ChatGPT & Gemini.
                                </p>
                            </div>
                        ) : isGenerating ? (
                            <div className="w-full h-full min-h-[450px] rounded-2xl border border-amber-500/30 bg-zinc-900/40 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-px bg-amber-400 shadow-[0_0_15px_#F59E0B] animate-scan"></div>
                                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
                                <h3 className="text-lg font-bold font-mono uppercase text-amber-400 tracking-wider">
                                    Calibrating Lighting & Packaging Physics
                                </h3>
                                <p className="text-xs text-zinc-400 font-mono mt-2 max-w-xs">
                                    Configuring macro depth of field, caustics, and specular highlights for ChatGPT (GPT-4o) & Gemini (Imagen 3)...
                                </p>
                            </div>
                        ) : result ? (
                            <div className="w-full flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 fade-in">

                                {/* Top Product Packaging DNA Card */}
                                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.08)] flex flex-col gap-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                                                    {result.product_dna.product_name}
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                                        PACKAGING LOCKED
                                                    </span>
                                                </h3>
                                                <span className="text-xs text-zinc-400 font-mono">
                                                    {result.product_dna.category}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={copyAllBundle}
                                            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold font-mono text-xs shadow-md"
                                        >
                                            {copiedKey === 'bundle' ? (
                                                <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied All Ad Prompts</>
                                            ) : (
                                                <><Download className="w-3.5 h-3.5 mr-1.5" /> Export All Prompts Bundle</>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Packaging Features */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                                        {result.product_dna.key_packaging_features.map((feat, idx) => (
                                            <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-start gap-2">
                                                <span className="text-amber-400 font-bold">•</span>
                                                <span className="leading-tight">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Target Model Selector Tabs */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            Active Target Engine Format:
                                        </span>
                                        <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
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
                                                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
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

                                {/* Generated Scene Cards */}
                                <div className="flex flex-col gap-4">
                                    {result.scenes.map((scene, index) => {
                                        const promptText = activeTab === 'chatgpt' ? scene.chatgpt_prompt : activeTab === 'gemini' ? scene.gemini_prompt : scene.midjourney_prompt
                                        const isCopied = copiedKey === scene.id

                                        return (
                                            <div key={scene.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3 relative group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-zinc-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                                                            {index + 1}
                                                        </span>
                                                        <h4 className="text-sm font-bold font-mono text-white">
                                                            {scene.title}
                                                        </h4>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => copyToClipboard(promptText, scene.id)}
                                                        className={`h-8 px-3 rounded-lg font-mono text-xs font-bold transition-all ${
                                                            isCopied
                                                                ? 'bg-emerald-500 text-zinc-950'
                                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                                        }`}
                                                    >
                                                        {isCopied ? (
                                                            <><Check className="w-3.5 h-3.5 mr-1" /> Copied</>
                                                        ) : (
                                                            <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-200 font-serif text-sm leading-relaxed">
                                                    {promptText}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Ad Strategy Pro Tip */}
                                {result.ad_strategy_tip && (
                                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                                        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                                                E-Commerce Ad Strategy Tip:
                                            </span>
                                            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                {result.ad_strategy_tip}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : null}
                    </div>

                </div>

            </div>

            {/* Image Cropping Dialog */}
            <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
                <DialogContent className="max-w-xl bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-mono uppercase text-sm">Crop Product Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-4 max-h-[60vh] overflow-auto">
                        {previewUrl && (
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                                <img ref={imgRef} src={previewUrl} onLoad={onImageLoad} alt="Crop preview" className="max-h-[50vh]" />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="ghost" onClick={() => setCropModalOpen(false)} className="font-mono text-xs">Cancel</Button>
                        <Button onClick={applyCrop} className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs font-bold">Apply Crop</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
