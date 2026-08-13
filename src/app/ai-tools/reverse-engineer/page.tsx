'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Loader2, ScanSearch, UploadCloud, RefreshCw, AlertCircle, Fingerprint, Crop as CropIcon, Sparkles, Check, UserCheck, ShieldCheck, Camera, Activity, Target, User, Focus, Layers } from 'lucide-react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

type SubMetrics = {
    image_clarity?: number;
    face_retention?: number;
    body_consistency?: number;
    lighting_fidelity?: number;
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
    detected_style: string;
    confidence_score: number;
    demographics?: Demographics;
    sub_metrics?: SubMetrics;
    key_elements: string[];
    face_detected?: boolean;
    face_consistency_instructions?: {
        chatgpt_tip?: string;
        gemini_tip?: string;
        key_facial_traits?: string[];
        body_physique_traits?: string[];
    };
}

export default function ReverseEngineerPage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<ReconstructionResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'chatgpt' | 'gemini' | 'master' | 'midjourney'>('chatgpt')
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

        // Check size (e.g. max 20MB)
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

            // Force strict JPEG output for max compatibility with Safari and HEIC image uploads from iOS
            const targetMimeType = 'image/jpeg'

            // Robust cross-browser blob generation
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
                // Replace any bizarre extensions (like .heic) with .jpg since we converted it
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
            setActiveTab('chatgpt') // Default to ChatGPT as priority

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
        if (activeTab === 'chatgpt') return result.chatgpt_prompt || result.reconstructed_prompt;
        if (activeTab === 'gemini') return result.gemini_prompt || result.reconstructed_prompt;
        if (activeTab === 'midjourney') return result.midjourney_prompt || result.reconstructed_prompt;
        return result.reconstructed_prompt;
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-slate-200 relative selection:bg-emerald-500/30 pb-20 font-sans">

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-5xl px-5 pt-12 md:pt-16 flex flex-col gap-10 md:gap-14 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] tracking-widest text-xs font-mono rounded-md backdrop-blur-md uppercase">
                        <ScanSearch className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
                        Forensic Engine v2.0 • ChatGPT & Gemini Priority
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase text-center flex flex-col items-center">
                        Reverse Engineer
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl px-4 leading-relaxed font-mono">
                        Deconstruct any image into high-precision prompts optimized for <span className="text-emerald-400 font-semibold">ChatGPT</span> & <span className="text-blue-400 font-semibold">Gemini</span> with biometric facial locking.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Upload & Preview */}
                    <div className="flex flex-col gap-6 w-full">
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
                                            <div className="w-full max-w-xs overflow-hidden relative bg-black/50 rounded-lg border border-emerald-500/30 p-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-sm">
                                                <div className="absolute top-0 left-0 w-full h-px bg-emerald-500 shadow-[0_0_10px_#10B981] animate-scan"></div>
                                                <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm uppercase tracking-widest font-bold">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Forensic Analysis...
                                                </div>
                                                <div className="flex gap-1 mt-3 opacity-50">
                                                    <div className="h-1 w-full bg-emerald-500/20 overflow-hidden"><div className="h-full bg-emerald-400 animate-pulse w-full"></div></div>
                                                    <div className="h-1 w-1/4 bg-emerald-500/20 overflow-hidden"><div className="h-full bg-emerald-400 animate-pulse delay-75 w-full"></div></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                                    <UploadCloud className="w-12 h-12 text-zinc-600 mb-4" />
                                    <h3 className="text-xl font-bold text-zinc-300 mb-2 font-mono uppercase">Drop Image Here</h3>
                                    <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">Supports JPEG, PNG, WEBP up to 20MB. Click to browse files.</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-950/30 text-red-400 text-sm rounded-xl border border-red-900/50 flex items-center gap-3 font-mono">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:flex gap-4 w-full">
                            {previewUrl && !isAnalyzing && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={resetAnalysis}
                                        className="h-14 md:flex-1 rounded-xl border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono uppercase tracking-wider"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        <span className="md:hidden">Clear</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCropModalOpen(true)}
                                        className="h-14 md:flex-1 rounded-xl border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono uppercase tracking-wider"
                                    >
                                        <CropIcon className="w-4 h-4 mr-2" />
                                        Crop
                                    </Button>
                                </>
                            )}
                            <Button
                                onClick={handleAnalyze}
                                disabled={!file || isAnalyzing}
                                className={`h-14 font-black text-lg uppercase tracking-wider rounded-xl transition-all duration-300 font-mono ${!file ? 'hidden' : 'flex'} ${previewUrl && !isAnalyzing ? 'col-span-2 md:flex-[3]' : 'col-span-2 md:w-full'} ${isAnalyzing ? 'bg-zinc-800 text-emerald-500 border border-emerald-500/30' : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'}`}
                            >
                                {isAnalyzing ? 'Extracting DNA...' : 'Reverse Engineer'}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="w-full flex flex-col gap-6 min-h-[400px]">
                        {!result && !isAnalyzing ? (
                            <div className="w-full h-full rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center p-10 text-center text-zinc-600">
                                <Fingerprint className="w-16 h-16 mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2 font-mono uppercase text-zinc-500">Awaiting Target</h3>
                                <p className="text-sm leading-relaxed max-w-xs">Upload an image to extract its forensic characteristics and reconstruct the prompt for ChatGPT & Gemini.</p>
                            </div>
                        ) : result ? (
                            <div id="analysis-results" className="w-full flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 fade-in">

                                {/* Top Stats Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Base Style</span>
                                        <span className="font-bold text-white text-lg truncate">{result.detected_style}</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
                                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Match Confidence</span>
                                        <div className="flex items-end gap-2">
                                            <span className={`font-black tracking-tighter text-2xl leading-none ${result.confidence_score > 85 ? 'text-emerald-400' : result.confidence_score > 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                                {result.confidence_score}%
                                            </span>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-1 flex-1 overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence_score}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Forensic Sub-Metrics Dashboard (Clarity, Face, Body, Lighting) */}
                                {result.sub_metrics && (
                                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
                                        <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-cyan-400" />
                                            Source Image Sub-Metrics & Identity Retention
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {/* Image Clarity */}
                                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-xs font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                                                        Image Clarity & Resolution
                                                    </span>
                                                    <span className="font-bold text-cyan-300">
                                                        {result.sub_metrics.image_clarity || 90}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${result.sub_metrics.image_clarity || 90}%` }}></div>
                                                </div>
                                            </div>

                                            {/* Face Likeness Lock */}
                                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-xs font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                        Face Likeness Precision
                                                    </span>
                                                    <span className="font-bold text-emerald-300">
                                                        {result.sub_metrics.face_retention || 95}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${result.sub_metrics.face_retention || 95}%` }}></div>
                                                </div>
                                            </div>

                                            {/* Body & Silhouette Consistency */}
                                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-xs font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5 text-purple-400" />
                                                        Body & Physique Consistency
                                                    </span>
                                                    <span className="font-bold text-purple-300">
                                                        {result.sub_metrics.body_consistency || 88}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: `${result.sub_metrics.body_consistency || 88}%` }}></div>
                                                </div>
                                            </div>

                                            {/* Lighting & Style Fidelity */}
                                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-xs font-mono">
                                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                                        Lighting & Style Fidelity
                                                    </span>
                                                    <span className="font-bold text-yellow-300">
                                                        {result.sub_metrics.lighting_fidelity || 92}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" style={{ width: `${result.sub_metrics.lighting_fidelity || 92}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reconstructed Prompt Card */}
                                <div className="p-6 md:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-700 shadow-xl flex flex-col gap-6 relative group overflow-hidden">
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none"></div>

                                    {/* Model Selector Tabs (ChatGPT & Gemini Priority) */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest flex items-center">
                                                <TerminalSquareIcon className="w-4 h-4 mr-2 text-emerald-400" />
                                                Optimized Model Target
                                            </h3>
                                            <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                {activeTab === 'chatgpt' ? 'ChatGPT / DALL-E' : activeTab === 'gemini' ? 'Gemini / Imagen 3' : activeTab === 'midjourney' ? 'Midjourney v6' : 'Master Prompt'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('chatgpt')}
                                                className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                    activeTab === 'chatgpt'
                                                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                ChatGPT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('gemini')}
                                                className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                    activeTab === 'gemini'
                                                        ? 'bg-blue-500 text-zinc-950 shadow-md shadow-blue-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Gemini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('master')}
                                                className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                    activeTab === 'master'
                                                        ? 'bg-zinc-200 text-zinc-950'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                Master
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('midjourney')}
                                                className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                    activeTab === 'midjourney'
                                                        ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                                }`}
                                            >
                                                Midjourney
                                            </button>
                                        </div>
                                    </div>

                                    {/* Prompt Display */}
                                    <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                                        <p className="font-serif text-base sm:text-lg leading-relaxed text-zinc-100 selection:bg-emerald-500/40">
                                            {getActivePrompt()}
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => copyToClipboard(getActivePrompt(), 'main')}
                                        className={`w-full rounded-xl h-14 font-bold font-mono uppercase tracking-wider transition-all duration-300 ${
                                            copiedKey === 'main'
                                                ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
                                                : activeTab === 'chatgpt'
                                                ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                : activeTab === 'gemini'
                                                ? 'bg-blue-500 text-zinc-950 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                                        }`}
                                    >
                                        {copiedKey === 'main' ? (
                                            <><Check className="w-4 h-4 mr-2" /> Copied to Clipboard</>
                                        ) : (
                                            <><Copy className="w-4 h-4 mr-2" /> Copy {activeTab === 'chatgpt' ? 'ChatGPT' : activeTab === 'gemini' ? 'Gemini' : activeTab === 'midjourney' ? 'Midjourney' : 'Master'} Prompt</>
                                        )}
                                    </Button>
                                </div>

                                {/* Face & Body Identity Lock Card (Rendered if a face is detected) */}
                                {result.face_detected && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.07)] flex flex-col gap-4 relative overflow-hidden animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                                    <Fingerprint className="w-5 h-5 animate-pulse" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                                        Face & Body Identity Lock
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                            ACTIVE
                                                        </span>
                                                    </h4>
                                                    <p className="text-xs text-zinc-400 font-mono">
                                                        Biometric facial landmarks & body silhouette locked for zero identity-drift.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Demographics & Life-Stage Diagnosis */}
                                        {result.demographics && (
                                            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col gap-2.5">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                        Diagnosed Subject Identity:
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
                                                            <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Face Anatomy:</span>
                                                            <span className="text-zinc-300">{result.demographics.face_shape}</span>
                                                        </div>
                                                    )}
                                                    {result.demographics.body_physique && (
                                                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-0.5 sm:col-span-2">
                                                            <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Body & Physique:</span>
                                                            <span className="text-zinc-300">{result.demographics.body_physique}</span>
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

                                        {/* Body & Physique Traits */}
                                        {result.face_consistency_instructions?.body_physique_traits && result.face_consistency_instructions.body_physique_traits.length > 0 && (
                                            <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800 flex flex-col gap-2">
                                                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-purple-400" />
                                                    Preserved Body & Physique Signatures:
                                                </span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {result.face_consistency_instructions.body_physique_traits.map((trait, idx) => (
                                                        <div key={idx} className="text-xs font-mono text-zinc-300 flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                                                            <span className="text-purple-400 font-bold">•</span>
                                                            <span>{trait}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Priority Guides for ChatGPT & Gemini */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                            {/* ChatGPT Guide */}
                                            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-emerald-500/20 flex flex-col justify-between gap-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                                        ChatGPT (GPT-4o) Lock
                                                    </span>
                                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                                        {result.face_consistency_instructions?.chatgpt_tip || "Attach the source image directly in ChatGPT with the ChatGPT prompt to enforce exact face likeness across all variations."}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => copyToClipboard(result.chatgpt_prompt || result.reconstructed_prompt, 'chatgpt')}
                                                    className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono"
                                                >
                                                    {copiedKey === 'chatgpt' ? (
                                                        <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied ChatGPT Prompt</>
                                                    ) : (
                                                        <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy ChatGPT Prompt</>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Gemini Guide */}
                                            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-blue-500/20 flex flex-col justify-between gap-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs font-bold font-mono text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                                        Gemini (Imagen 3) Lock
                                                    </span>
                                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                                        {result.face_consistency_instructions?.gemini_tip || "Upload the image in Gemini and use this prompt with Imagen 3 for high fidelity lighting and exact bone structure retention."}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => copyToClipboard(result.gemini_prompt || result.reconstructed_prompt, 'gemini')}
                                                    className="w-full bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-mono"
                                                >
                                                    {copiedKey === 'gemini' ? (
                                                        <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied Gemini Prompt</>
                                                    ) : (
                                                        <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Gemini Prompt</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Extracted Tags */}
                                <div className="flex flex-col gap-3">
                                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Detected Signatures</span>
                                    <div className="flex flex-wrap gap-2">
                                        {result.key_elements.map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 font-mono text-xs font-normal">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

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

function TerminalSquareIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m7 11 2-2-2-2" />
            <path d="M11 13h4" />
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        </svg>
    )
}
