'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Copy, Loader2, ScanSearch, UploadCloud, RefreshCw, AlertCircle,
    Fingerprint, Crop as CropIcon, Sparkles, Check, UserCheck, Camera,
    Activity, Target, User, Focus, Layers, Sliders, Palette, Zap,
    Ban, Eye, FileText, Sun, Compass, Shirt, MapPin, Film, CheckCircle2
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

type SceneBreakdown = {
    medium_and_style?: string;
    camera_and_optics?: string;
    lighting_and_atmosphere?: string;
    subject_and_pose?: string;
    wardrobe_and_styling?: string;
    environment_and_background?: string;
    color_palette?: string[];
}

type SubMetrics = {
    image_clarity?: number;
    face_retention?: number;
    body_consistency?: number;
    lighting_fidelity?: number;
    composition_accuracy?: number;
    styling_precision?: number;
}

type Demographics = {
    identity_classification?: string;
    gender?: string;
    estimated_age?: string;
    body_physique?: string;
    face_shape?: string;
}

type ReconstructionResult = {
    reconstructed_prompt: string;
    chatgpt_prompt?: string;
    gemini_prompt?: string;
    midjourney_prompt?: string;
    flux_prompt?: string;
    face_lock_dna?: string;
    negative_prompt?: string;
    detected_style: string;
    aspect_ratio?: string;
    confidence_score: number;
    demographics?: Demographics;
    sub_metrics?: SubMetrics;
    key_elements: string[];
    face_detected?: boolean;
    scene_breakdown?: SceneBreakdown;
    face_consistency_instructions?: {
        chatgpt_tip?: string;
        gemini_tip?: string;
        midjourney_tip?: string;
        flux_tip?: string;
        key_facial_traits?: string[];
        body_physique_traits?: string[];
    };
}

export default function ReverseEngineerPage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [subjectType, setSubjectType] = useState<'auto' | 'any_person' | 'woman' | 'man' | 'girl' | 'boy' | 'non_human'>('auto')
    const [recreationMode, setRecreationMode] = useState<'exact_clone' | 'photo_upgrade' | 'artistic'>('exact_clone')

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<ReconstructionResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'master' | 'chatgpt' | 'gemini' | 'midjourney' | 'flux' | 'face_dna' | 'negative'>('master')
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

        // Check size (max 20MB)
        if (selectedFile.size > 20 * 1024 * 1024) {
            setError("Image size must be less than 20MB.")
            return
        }

        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setError(null)
        setResult(null)

        // Reset cropper state and open modal
        setCrop(undefined)
        setCompletedCrop(null)
        setCropModalOpen(true)
    }, [])

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 70,
                },
                1,
                width,
                height
            ),
            width,
            height
        )
        setCrop(initialCrop)
    }

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current || !previewUrl) {
            setCropModalOpen(false)
            return
        }

        // Prevent zero-pixel crops which throw DOM exceptions
        if (completedCrop.width <= 0 || completedCrop.height <= 0) {
            setCropModalOpen(false)
            return
        }

        try {
            const image = imgRef.current
            const canvas = document.createElement('canvas')
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                throw new Error('No 2d context')
            }

            const pixelRatio = window.devicePixelRatio || 1
            const cropWidth = Math.max(1, Math.floor(completedCrop.width * scaleX))
            const cropHeight = Math.max(1, Math.floor(completedCrop.height * scaleY))

            canvas.width = cropWidth * pixelRatio
            canvas.height = cropHeight * pixelRatio

            ctx.scale(pixelRatio, pixelRatio)
            ctx.imageSmoothingQuality = 'high'

            const cropX = completedCrop.x * scaleX
            const cropY = completedCrop.y * scaleY

            ctx.drawImage(
                image,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            )

            const targetMimeType = 'image/jpeg'

            let blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), targetMimeType, 0.95)
            })

            // Safari / iOS Fallback
            if (!blob) {
                const dataUrl = canvas.toDataURL(targetMimeType, 0.95)
                if (dataUrl && dataUrl !== 'data:,') {
                    const res = await fetch(dataUrl)
                    blob = await res.blob()
                }
            }

            if (blob) {
                const originalName = file?.name || 'cropped-image.jpg'
                const safeName = originalName.includes('.') ? originalName.replace(/\.[^/.]+$/, "") + ".jpg" : 'cropped.jpg'

                const croppedFile = new File([blob], safeName, { type: targetMimeType })
                setFile(croppedFile)
                setPreviewUrl(URL.createObjectURL(croppedFile))
            } else {
                setError("Failed to generate cropped image blob.")
            }
        } catch (e: any) {
            console.error("Failed to crop image", e)
            setError(`Cropping failed: ${e.message || 'Unknown error'}`)
        }

        setCropModalOpen(false)
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }, [handleFile])

    const handleSelectFileClick = () => {
        fileInputRef.current?.click()
    }

    const resetAnalysis = () => {
        setFile(null)
        setPreviewUrl(null)
        setResult(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true)
        setError(null)
        setResult(null)

        const formData = new FormData()
        formData.append('image', file)
        formData.append('subjectType', subjectType)
        formData.append('recreationMode', recreationMode)

        try {
            const res = await fetch('/api/reverse-engineer', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorText = await res.text()
                let errorMessage = 'Failed to analyze image.'
                try {
                    const parsed = JSON.parse(errorText)
                    errorMessage = parsed.error || errorMessage
                } catch {
                    errorMessage = errorText
                }

                if (res.status === 413 || errorMessage.toLowerCase().includes('payload') || errorMessage.toLowerCase().includes('large')) {
                    throw new Error("The selected image is too large for the forensic engine to process. Please crop it smaller, or use a lower resolution version.")
                }
                if (res.status === 504 || errorMessage.toLowerCase().includes('timeout')) {
                    throw new Error("The AI vision model timed out analyzing this image. Please wait a moment and try scanning again.")
                }
                if (errorMessage.toLowerCase().includes('json') || errorMessage.toLowerCase().includes('token')) {
                    throw new Error("We encountered a brief interruption connecting to the AI models. Please try scanning the image again.")
                }

                throw new Error(errorMessage)
            }

            const data = await res.json()
            setResult(data.result)
            setActiveTab('master')

            setTimeout(() => {
                document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100);

        } catch (err: any) {
            let uiError = err.message || 'An unexpected error occurred during forensic analysis.'
            if (uiError === 'Failed to fetch') {
                uiError = "We couldn't connect to the AI engine. Please check your internet connection and try again."
            }
            setError(uiError)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const copyToClipboard = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const getActivePrompt = () => {
        if (!result) return '';
        if (activeTab === 'master') return result.reconstructed_prompt;
        if (activeTab === 'chatgpt') return result.chatgpt_prompt || result.reconstructed_prompt;
        if (activeTab === 'gemini') return result.gemini_prompt || result.reconstructed_prompt;
        if (activeTab === 'midjourney') return result.midjourney_prompt || result.reconstructed_prompt;
        if (activeTab === 'flux') return result.flux_prompt || result.reconstructed_prompt;
        if (activeTab === 'face_dna') return result.face_lock_dna || result.reconstructed_prompt;
        if (activeTab === 'negative') return result.negative_prompt || 'blurry, low quality, distorted anatomy, extra limbs, bad hands, deformed fingers, plastic skin, cartoon, oversaturated, watermark, text';
        return result.reconstructed_prompt;
    }

    const copyFullDossier = () => {
        if (!result) return;
        const dossier = `# 📸 FORENSIC 1:1 RECREATION DOSSIER

## 🎯 Master 1:1 Recreation Prompt
${result.reconstructed_prompt}

## 🤖 ChatGPT (DALL-E 3) Prompt
${result.chatgpt_prompt || result.reconstructed_prompt}

## 💎 Google Gemini (Imagen 3) Prompt
${result.gemini_prompt || result.reconstructed_prompt}

## 🎨 Midjourney v6.1 Prompt
${result.midjourney_prompt || result.reconstructed_prompt}

## ⚡ FLUX.1 Prompt
${result.flux_prompt || result.reconstructed_prompt}

${result.face_lock_dna ? `## 🧬 Biometric Face-DNA Anchor\n${result.face_lock_dna}\n` : ''}
## 🚫 Negative Prompt
${result.negative_prompt || 'blurry, low quality, bad anatomy, deformed fingers, extra limbs, plastic skin, 3d render, cartoon, oversaturated, watermark, text'}

---
## 🔍 Forensic Scene Breakdown
- **Art Medium & Style:** ${result.scene_breakdown?.medium_and_style || result.detected_style}
- **Camera & Optics:** ${result.scene_breakdown?.camera_and_optics || '85mm f/1.4, eye-level framing'}
- **Lighting & Atmosphere:** ${result.scene_breakdown?.lighting_and_atmosphere || 'Directional natural lighting'}
- **Subject & Pose:** ${result.scene_breakdown?.subject_and_pose || result.demographics?.identity_classification || 'Specified subject'}
- **Wardrobe & Textures:** ${result.scene_breakdown?.wardrobe_and_styling || 'Detailed styling'}
- **Setting & Background:** ${result.scene_breakdown?.environment_and_background || 'Original scene setting'}
- **Aspect Ratio:** ${result.aspect_ratio || '16:9'}
- **Confidence Score:** ${result.confidence_score}%
`;
        copyToClipboard(dossier, 'full_dossier')
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-slate-200 relative selection:bg-emerald-500/30 pb-20 font-sans">

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-6xl px-4 sm:px-6 pt-10 md:pt-14 flex flex-col gap-8 md:gap-12 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] tracking-widest text-xs font-mono rounded-md backdrop-blur-md uppercase">
                        <ScanSearch className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
                        7-Layer Forensic Engine • Exact 1:1 Picture Recreation
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase text-center flex flex-col items-center">
                        Reverse Engineer
                    </h1>
                    <p className="text-zinc-400 text-base md:text-lg font-medium max-w-2xl px-4 leading-relaxed font-mono">
                        Deconstruct any picture into <span className="text-emerald-400 font-semibold">1:1 high-precision prompts</span> tailored for <span className="text-emerald-300">ChatGPT</span>, <span className="text-blue-400">Gemini</span>, <span className="text-purple-400">Midjourney</span>, and <span className="text-amber-400">FLUX.1</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Upload & Precision Controls (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-5 w-full">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={!previewUrl ? handleSelectFileClick : undefined}
                            className={`
                                w-full aspect-square md:aspect-video lg:aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-all duration-300
                                ${previewUrl ? 'border-zinc-700 bg-zinc-900/50' :
                                    isDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-600 cursor-pointer'}
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
                                <div className="absolute inset-0 w-full h-full group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Preview" className={`w-full h-full object-contain p-2 ${isAnalyzing ? 'opacity-50 blur-sm' : ''} transition-all duration-500`} />

                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20">
                                            <div className="w-full max-w-xs overflow-hidden relative bg-black/70 rounded-xl border border-emerald-500/30 p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md">
                                                <div className="absolute top-0 left-0 w-full h-px bg-emerald-500 shadow-[0_0_10px_#10B981] animate-scan"></div>
                                                <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm uppercase tracking-widest font-bold">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Forensic 7-Layer Scan...
                                                </div>
                                                <p className="text-[11px] text-zinc-400 font-mono mt-2 leading-tight">
                                                    Extracting lens optics, lighting angles, fabric textures & identity locks...
                                                </p>
                                                <div className="flex gap-1 mt-3 opacity-60">
                                                    <div className="h-1 w-full bg-emerald-500/20 overflow-hidden"><div className="h-full bg-emerald-400 animate-pulse w-full"></div></div>
                                                    <div className="h-1 w-1/3 bg-emerald-500/20 overflow-hidden"><div className="h-full bg-emerald-400 animate-pulse delay-75 w-full"></div></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                                    <UploadCloud className="w-12 h-12 text-zinc-600 mb-4" />
                                    <h3 className="text-lg font-bold text-zinc-300 mb-1 font-mono uppercase">Drop Target Image</h3>
                                    <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">Supports JPEG, PNG, WEBP up to 20MB. Click to browse files.</p>
                                </div>
                            )}
                        </div>

                        {/* Recreation Precision Goal Option */}
                        {file && (
                            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                                        Recreation Precision Goal
                                    </span>
                                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                                        {recreationMode === 'exact_clone' ? '🎯 1:1 Precision' : recreationMode === 'photo_upgrade' ? '📸 35mm Realism' : '🎨 Artistic'}
                                    </span>
                                </span>

                                <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                    <button
                                        type="button"
                                        onClick={() => setRecreationMode('exact_clone')}
                                        className={`py-2 px-1.5 rounded font-mono text-[11px] font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                                            recreationMode === 'exact_clone'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        <span className="font-extrabold">🎯 1:1 Clone</span>
                                        <span className="text-[9px] opacity-75">Exact Picture</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRecreationMode('photo_upgrade')}
                                        className={`py-2 px-1.5 rounded font-mono text-[11px] font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                                            recreationMode === 'photo_upgrade'
                                                ? 'bg-cyan-500 text-zinc-950 shadow-sm shadow-cyan-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        <span className="font-extrabold">📸 35mm Film</span>
                                        <span className="text-[9px] opacity-75">Cinema Photo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRecreationMode('artistic')}
                                        className={`py-2 px-1.5 rounded font-mono text-[11px] font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                                            recreationMode === 'artistic'
                                                ? 'bg-purple-500 text-zinc-950 shadow-sm shadow-purple-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        <span className="font-extrabold">🎨 Artistic</span>
                                        <span className="text-[9px] opacity-75">Digital Art</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Subject / Demographic Lock Option */}
                        {file && (
                            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                                        <User className="w-3.5 h-3.5 text-emerald-400" />
                                        Target Demographic Mode
                                    </span>
                                    <span className="text-[10px] text-zinc-500">Subject Framing</span>
                                </span>

                                <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('auto')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all ${
                                            subjectType === 'auto'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        🤖 Auto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('woman')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all ${
                                            subjectType === 'woman'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        👩 Woman
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('man')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all ${
                                            subjectType === 'man'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        👨 Man
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('any_person')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all ${
                                            subjectType === 'any_person'
                                                ? 'bg-cyan-500 text-zinc-950 shadow-sm shadow-cyan-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        👤 Any
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('girl')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all ${
                                            subjectType === 'girl'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        👧 Girl
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('boy')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all ${
                                            subjectType === 'boy'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        👦 Boy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubjectType('non_human')}
                                        className={`py-1.5 px-1 rounded font-mono text-[11px] font-bold transition-all col-span-2 ${
                                            subjectType === 'non_human'
                                                ? 'bg-purple-500 text-zinc-950 shadow-sm shadow-purple-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        🏞️ Object / Scene
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-950/30 text-red-400 text-xs rounded-xl border border-red-900/50 flex items-center gap-3 font-mono">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:flex gap-3 w-full">
                            {previewUrl && !isAnalyzing && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={resetAnalysis}
                                        className="h-12 md:flex-1 rounded-xl border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono uppercase tracking-wider text-xs"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                        Clear
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCropModalOpen(true)}
                                        className="h-12 md:flex-1 rounded-xl border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono uppercase tracking-wider text-xs"
                                    >
                                        <CropIcon className="w-3.5 h-3.5 mr-1.5" />
                                        Crop
                                    </Button>
                                </>
                            )}
                            <Button
                                onClick={handleAnalyze}
                                disabled={!file || isAnalyzing}
                                className={`h-12 font-black text-sm uppercase tracking-wider rounded-xl transition-all duration-300 font-mono ${!file ? 'hidden' : 'flex'} ${previewUrl && !isAnalyzing ? 'col-span-2 md:flex-[3]' : 'col-span-2 md:w-full'} ${isAnalyzing ? 'bg-zinc-800 text-emerald-500 border border-emerald-500/30' : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'}`}
                            >
                                {isAnalyzing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deconstructing...</>
                                ) : (
                                    <><Target className="w-4 h-4 mr-2" /> Reverse Engineer (1:1 Clone)</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Results & 7-Layer Deconstruction (7 cols) */}
                    <div className="lg:col-span-7 w-full flex flex-col gap-6 min-h-[400px]">
                        {!result && !isAnalyzing ? (
                            <div className="w-full h-full min-h-[380px] rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center p-8 text-center text-zinc-600">
                                <Fingerprint className="w-16 h-16 mb-4 opacity-40 text-emerald-500/60" />
                                <h3 className="text-lg font-bold mb-2 font-mono uppercase text-zinc-400">Awaiting Target Image</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                                    Upload any image to extract an exact 1:1 recreation prompt blueprint covering lens optics, lighting geometry, clothing textures, and color grading.
                                </p>
                            </div>
                        ) : result ? (
                            <div id="analysis-results" className="w-full flex flex-col gap-5 animate-in slide-in-from-right-6 duration-500 fade-in">

                                {/* Top Stats Row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Base Medium</span>
                                        <span className="font-bold text-white text-sm truncate" title={result.detected_style}>
                                            {result.detected_style}
                                        </span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Aspect Ratio</span>
                                        <span className="font-bold text-emerald-400 text-sm font-mono">
                                            {result.aspect_ratio || '16:9'}
                                        </span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Clone Match</span>
                                        <div className="flex items-end gap-1.5">
                                            <span className="font-black text-emerald-400 text-sm font-mono">
                                                {result.confidence_score}%
                                            </span>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-1 flex-1 overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence_score}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reconstructed Prompt Card with Engine Selector */}
                                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/95 border border-zinc-700 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none"></div>

                                    {/* Engine Tabs (7 Targets) */}
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                                Optimized Generator Target:
                                            </h3>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={copyFullDossier}
                                                className="h-6 px-2 text-[10px] font-mono border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white"
                                            >
                                                {copiedKey === 'full_dossier' ? (
                                                    <><Check className="w-3 h-3 mr-1 text-emerald-400" /> Dossier Copied!</>
                                                ) : (
                                                    <><FileText className="w-3 h-3 mr-1 text-emerald-400" /> Copy Full Dossier</>
                                                )}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-7 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('master')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'master'
                                                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                🎯 Master
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('chatgpt')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'chatgpt'
                                                        ? 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-400/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                🤖 ChatGPT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('gemini')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'gemini'
                                                        ? 'bg-blue-500 text-zinc-950 shadow-md shadow-blue-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                💎 Gemini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('midjourney')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'midjourney'
                                                        ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                🎨 Midjourney
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('flux')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'flux'
                                                        ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                ⚡ FLUX
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('face_dna')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'face_dna'
                                                        ? 'bg-teal-400 text-zinc-950 shadow-md shadow-teal-400/20'
                                                        : 'text-teal-400 hover:text-teal-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                🧬 Face DNA
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('negative')}
                                                className={`py-1.5 px-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                    activeTab === 'negative'
                                                        ? 'bg-rose-500 text-zinc-950 shadow-md shadow-rose-500/20'
                                                        : 'text-rose-400 hover:text-rose-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                🚫 Negative
                                            </button>
                                        </div>
                                    </div>

                                    {/* Prompt Display Box */}
                                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 relative">
                                        <p className="font-serif text-sm sm:text-base leading-relaxed text-zinc-100 selection:bg-emerald-500/40">
                                            {getActivePrompt()}
                                        </p>
                                    </div>

                                    {/* Engine-Specific Tip Alert */}
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span>
                                            {activeTab === 'master' && "Master 1:1 Prompt: Contains all 7 forensic layers for high-precision replication across any generator."}
                                            {activeTab === 'chatgpt' && "ChatGPT / DALL-E 3: Paste directly in ChatGPT. For best results, attach your source image alongside this prompt."}
                                            {activeTab === 'gemini' && "Google Gemini (Imagen 3): Optimized with optical parameters (85mm lens, subsurface scattering, authentic skin pores)."}
                                            {activeTab === 'midjourney' && "Midjourney v6.1: Configured with --style raw and matched aspect ratio to eliminate unwanted AI stylization."}
                                            {activeTab === 'flux' && "FLUX.1: Dense natural language prompt crafted for FLUX.1 Dev/Schnell text-encoders."}
                                            {activeTab === 'face_dna' && "Face DNA Anchor: Copy and append this 50-word biometric DNA block to lock facial identity across multiple seeds."}
                                            {activeTab === 'negative' && "Negative Prompt: Paste into negative prompt fields in Stable Diffusion / FLUX web UIs to block artifacts."}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => copyToClipboard(getActivePrompt(), 'main')}
                                        className={`w-full rounded-xl h-12 font-bold font-mono uppercase tracking-wider text-xs transition-all duration-300 ${
                                            copiedKey === 'main'
                                                ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
                                                : activeTab === 'master'
                                                ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                : activeTab === 'chatgpt'
                                                ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                                                : activeTab === 'gemini'
                                                ? 'bg-blue-500 text-zinc-950 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : activeTab === 'midjourney'
                                                ? 'bg-purple-500 text-zinc-950 hover:bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                                : activeTab === 'flux'
                                                ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                                : activeTab === 'face_dna'
                                                ? 'bg-teal-400 hover:bg-teal-300 text-zinc-950 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                                                : 'bg-rose-500 hover:bg-rose-400 text-zinc-950 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                                        }`}
                                    >
                                        {copiedKey === 'main' ? (
                                            <><Check className="w-4 h-4 mr-2" /> Copied to Clipboard!</>
                                        ) : (
                                            <><Copy className="w-4 h-4 mr-2" /> Copy {activeTab.toUpperCase()} Prompt</>
                                        )}
                                    </Button>
                                </div>

                                {/* 6-Pillar Forensic Scene Breakdown */}
                                {result.scene_breakdown && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-4">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-emerald-400" />
                                                7-Layer Forensic Breakdown (Exact Scene Blueprint)
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                Inspect individual scene layers
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Art Medium & Pipeline */}
                                            {result.scene_breakdown.medium_and_style && (
                                                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 font-bold">
                                                            <Film className="w-3.5 h-3.5 text-cyan-400" />
                                                            1. Medium & Film Pipeline
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(result.scene_breakdown?.medium_and_style || '', 'medium')}
                                                            className="text-zinc-500 hover:text-cyan-400 transition-colors"
                                                            title="Copy medium"
                                                        >
                                                            {copiedKey === 'medium' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                        {result.scene_breakdown.medium_and_style}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Camera & Lens Optics */}
                                            {result.scene_breakdown.camera_and_optics && (
                                                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                                                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                                                            2. Camera & Lens Optics
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(result.scene_breakdown?.camera_and_optics || '', 'camera')}
                                                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                                                            title="Copy camera specs"
                                                        >
                                                            {copiedKey === 'camera' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                        {result.scene_breakdown.camera_and_optics}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Lighting & Atmosphere */}
                                            {result.scene_breakdown.lighting_and_atmosphere && (
                                                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-mono text-yellow-400 flex items-center gap-1.5 font-bold">
                                                            <Sun className="w-3.5 h-3.5 text-yellow-400" />
                                                            3. Lighting & Atmosphere
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(result.scene_breakdown?.lighting_and_atmosphere || '', 'lighting')}
                                                            className="text-zinc-500 hover:text-yellow-400 transition-colors"
                                                            title="Copy lighting"
                                                        >
                                                            {copiedKey === 'lighting' ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                        {result.scene_breakdown.lighting_and_atmosphere}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Subject, Pose & Eye Gaze */}
                                            {result.scene_breakdown.subject_and_pose && (
                                                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1.5 font-bold">
                                                            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                                                            4. Subject, Pose & Gaze
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(result.scene_breakdown?.subject_and_pose || '', 'subject_pose')}
                                                            className="text-zinc-500 hover:text-purple-400 transition-colors"
                                                            title="Copy subject and pose"
                                                        >
                                                            {copiedKey === 'subject_pose' ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                        {result.scene_breakdown.subject_and_pose}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Wardrobe, Materials & Details */}
                                            {result.scene_breakdown.wardrobe_and_styling && (
                                                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-mono text-pink-400 flex items-center gap-1.5 font-bold">
                                                            <Shirt className="w-3.5 h-3.5 text-pink-400" />
                                                            5. Wardrobe & Fabrics
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(result.scene_breakdown?.wardrobe_and_styling || '', 'wardrobe')}
                                                            className="text-zinc-500 hover:text-pink-400 transition-colors"
                                                            title="Copy wardrobe specs"
                                                        >
                                                            {copiedKey === 'wardrobe' ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                        {result.scene_breakdown.wardrobe_and_styling}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Setting, Environment & Props */}
                                            {result.scene_breakdown.environment_and_background && (
                                                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col justify-between gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5 font-bold">
                                                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                                            6. Setting & Depth Layers
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(result.scene_breakdown?.environment_and_background || '', 'environment')}
                                                            className="text-zinc-500 hover:text-indigo-400 transition-colors"
                                                            title="Copy setting"
                                                        >
                                                            {copiedKey === 'environment' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                        {result.scene_breakdown.environment_and_background}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Color Palette Swatches */}
                                        {result.scene_breakdown.color_palette && result.scene_breakdown.color_palette.length > 0 && (
                                            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 font-bold">
                                                        <Palette className="w-3.5 h-3.5 text-emerald-400" />
                                                        Extracted Color Harmonies & Tonal Grading
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">Click code to copy</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {result.scene_breakdown.color_palette.map((color, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => copyToClipboard(color, `color_${idx}`)}
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 transition-all group"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-white/20 shadow-sm shrink-0"
                                                                style={{ backgroundColor: color.startsWith('#') ? color : '#10B981' }}
                                                            />
                                                            <span>{color}</span>
                                                            {copiedKey === `color_${idx}` ? (
                                                                <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                                                            ) : null}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Face & Demographics Identity Lock Card */}
                                {result.face_detected && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.07)] flex flex-col gap-4 relative overflow-hidden animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                                    <Fingerprint className="w-5 h-5 animate-pulse" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                                        Face & Identity Lock
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                            ACTIVE
                                                        </span>
                                                    </h4>
                                                    <p className="text-xs text-zinc-400 font-mono">
                                                        Biometric facial landmarks & physical traits locked for zero identity-drift.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Demographics Diagnosis */}
                                        {result.demographics && (
                                            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col gap-2.5">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                        Subject Demographics:
                                                    </span>
                                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono py-0.5">
                                                        {result.demographics.identity_classification || result.demographics.gender || 'Person'}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                                                    {result.demographics.gender && (
                                                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                                                            <span className="text-zinc-500">Gender / Stage:</span>
                                                            <span className="font-bold text-white">{result.demographics.gender}</span>
                                                        </div>
                                                    )}
                                                    {result.demographics.estimated_age && (
                                                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                                                            <span className="text-zinc-500">Estimated Age:</span>
                                                            <span className="font-bold text-white">{result.demographics.estimated_age}</span>
                                                        </div>
                                                    )}
                                                    {result.demographics.face_shape && (
                                                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-0.5 sm:col-span-2">
                                                            <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Face Architecture:</span>
                                                            <span className="text-zinc-300">{result.demographics.face_shape}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Key Facial Traits */}
                                        {result.face_consistency_instructions?.key_facial_traits && result.face_consistency_instructions.key_facial_traits.length > 0 && (
                                            <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800 flex flex-col gap-2">
                                                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                    Preserved Facial Signatures:
                                                </span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {result.face_consistency_instructions.key_facial_traits.map((trait, idx) => (
                                                        <div key={idx} className="text-xs font-mono text-zinc-300 flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                                                            <span className="text-emerald-400 font-bold">•</span>
                                                            <span>{trait}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Biometric Face-DNA Anchor Block */}
                                        {result.face_lock_dna && (
                                            <div className="bg-zinc-950/90 rounded-xl p-4 border border-teal-500/30 flex flex-col gap-2.5 shadow-lg">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <span className="text-[11px] font-mono text-teal-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                                        <Fingerprint className="w-4 h-4 text-teal-400" />
                                                        Biometric Face-Lock DNA Anchor
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => copyToClipboard(result.face_lock_dna || '', 'face_dna_block')}
                                                        className="h-7 px-2.5 bg-teal-400 hover:bg-teal-300 text-zinc-950 font-bold font-mono text-[11px] rounded-lg"
                                                    >
                                                        {copiedKey === 'face_dna_block' ? (
                                                            <><Check className="w-3 h-3 mr-1" /> Copied Face DNA</>
                                                        ) : (
                                                            <><Copy className="w-3 h-3 mr-1" /> Copy Face DNA</>
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className="text-xs font-serif text-zinc-200 leading-relaxed bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                                                    {result.face_lock_dna}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 font-mono">
                                                    💡 Pro Tip: Paste this Biometric Anchor into any custom prompt or image generator to ensure 98%+ identical facial bone structure.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Detected Tags */}
                                {result.key_elements && result.key_elements.length > 0 && (
                                    <div className="flex flex-col gap-2.5">
                                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Detected Signatures</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.key_elements.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 font-mono text-[11px] font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : null}
                    </div>

                </div>
            </div>

            {/* Cropper Modal */}
            <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
                <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100 p-4 sm:p-6 rounded-2xl flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-mono text-xl uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                            <CropIcon className="w-5 h-5" />
                            Target Selection
                        </DialogTitle>
                        <p className="text-zinc-400 text-sm font-mono mt-2">
                            Drag to select the specific region of the image you want the AI to analyze. Click "Confirm Cropping" to apply.
                        </p>
                    </DialogHeader>

                    <div className="relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-black/50 flex justify-center items-center p-2 sm:p-4 min-h-[300px] flex-1">
                        {previewUrl && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                className="flex items-center justify-center max-h-full max-w-full"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={previewUrl}
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            </ReactCrop>
                        )}
                    </div>

                    <DialogFooter className="mt-6 flex gap-3 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setCropModalOpen(false)}
                            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        >
                            Skip Cropping
                        </Button>
                        <Button
                            onClick={handleCropComplete}
                            className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold tracking-wide"
                        >
                            Confirm Cropping
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

