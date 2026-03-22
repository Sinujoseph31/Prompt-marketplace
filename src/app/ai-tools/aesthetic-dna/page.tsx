'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Loader2, ScanSearch, UploadCloud, RefreshCw, AlertCircle, Fingerprint, Crop as CropIcon, Sparkles } from 'lucide-react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import PromptCard from '@/components/PromptCard'
import { createClient } from '@/utils/supabase/client'

type DnaResult = {
    primary_category: string;
    aesthetic_tags: string[];
    vibe_summary: string;
}

export default function AestheticDnaPage() {
    const supabase = createClient()
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<DnaResult | null>(null)
    const [matches, setMatches] = useState<any[]>([])
    const [isFetchingMatches, setIsFetchingMatches] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setError(null)
        setResult(null)
        setMatches([])

        setCrop(undefined)
        setCompletedCrop(null)
        setCropModalOpen(true)
    }, [])

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 70 }, 1, width, height),
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

        try {
            const image = imgRef.current
            const canvas = document.createElement('canvas')
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height
            const ctx = canvas.getContext('2d')

            if (!ctx) throw new Error('No 2d context')

            const pixelRatio = window.devicePixelRatio || 1
            const cropWidth = Math.max(1, Math.floor(completedCrop.width * scaleX))
            const cropHeight = Math.max(1, Math.floor(completedCrop.height * scaleY))

            canvas.width = cropWidth * pixelRatio
            canvas.height = cropHeight * pixelRatio

            ctx.scale(pixelRatio, pixelRatio)
            ctx.imageSmoothingQuality = 'high'

            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            )

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95)
            })

            if (blob) {
                const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
                setFile(croppedFile)
                setPreviewUrl(URL.createObjectURL(croppedFile))
            }
        } catch (e: any) {
            console.error("Failed to crop image", e)
        }
        setCropModalOpen(false)
    }

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true)
        setError(null)
        setResult(null)
        setMatches([])

        const formData = new FormData()
        formData.append('image', file)

        try {
            const res = await fetch('/api/aesthetic-dna', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error("Failed to analyze Visual DNA.")

            const data = await res.json()
            setResult(data.result)
            
            // Move to fetching matches
            fetchMatches(data.result)

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
            setIsAnalyzing(false)
        }
    }

    const fetchMatches = async (dna: DnaResult) => {
        setIsFetchingMatches(true)
        try {
            // Build query
            let query = supabase
                .from('prompts')
                .select('id, title, description, category, subcategory, price, preview_image, preview_images, preview_video, profiles(name), comments(rating)')
                .eq('status', 'approved')
            
            // Primary Category Filter
            if (dna.primary_category) {
                query = query.eq('category', dna.primary_category)
            }

            // Keyword Filter (OR mix of description and title using the tags)
            const keywordFilter = dna.aesthetic_tags.map(tag => `description.ilike.%${tag}%,title.ilike.%${tag}%`).join(',')
            if (keywordFilter) {
               query = query.or(keywordFilter)
            }

            const { data: prompts, error: searchError } = await query.limit(10)
            
            if (searchError) throw searchError
            setMatches(prompts || [])

            setTimeout(() => {
                document.getElementById('dna-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100);

        } catch (err) {
            console.error("Fetch Matches Error:", err)
        } finally {
            setIsFetchingMatches(false)
            setIsAnalyzing(false)
        }
    }

    const reset = () => {
        setFile(null)
        setPreviewUrl(null)
        setResult(null)
        setMatches([])
        setError(null)
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-slate-200 relative selection:bg-emerald-500/30 pb-20 font-sans overflow-x-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10B98108_1px,transparent_1px),linear-gradient(to_bottom,#10B98108_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="w-full max-w-6xl px-5 pt-12 md:pt-20 flex flex-col gap-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col gap-5 text-center items-center">
                    <Badge variant="outline" className="px-5 py-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] tracking-[0.2em] text-[10px] font-black rounded-full backdrop-blur-md uppercase">
                        Aura Analysis Engine
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white text-center leading-[0.9]">
                        Aesthetic <span className="text-emerald-500">DNA</span> Search
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl px-4 leading-relaxed font-mono opacity-80">
                        Upload a vibe. We'll deconstruct its visual soul and find every matching prompt in our marketplace.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Scanner Section */}
                    <div className="flex flex-col gap-6">
                        <div
                            onClick={!previewUrl ? () => fileInputRef.current?.click() : undefined}
                            className={`
                                w-full aspect-square rounded-[2rem] border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-all duration-500 group shadow-2xl
                                ${previewUrl ? 'border-zinc-800 bg-zinc-900/50' :
                                    isDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-emerald-500/50 cursor-pointer'}
                            `}
                        >
                            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" accept="image/*" />

                            {previewUrl ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <img src={previewUrl} alt="Preview" className={`w-full h-full object-cover ${isAnalyzing ? 'scale-110 opacity-30 blur-xl' : 'scale-100 opacity-100'} transition-all duration-1000 ease-out`} />
                                    
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-30">
                                            <div className="relative w-full h-1 bg-zinc-800 overflow-hidden rounded-full mb-4 max-w-[200px]">
                                                <div className="absolute h-full bg-emerald-500 w-1/2 animate-[dna-load_1.5s_infinite_ease-in-out]"></div>
                                            </div>
                                            <div className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-black animate-pulse flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Sequencing DNA...
                                            </div>
                                        </div>
                                    )}

                                    {/* Scan Line Animation */}
                                    {isAnalyzing && (
                                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent border-b border-emerald-500/50 z-20 animate-[dna-scan_2s_infinite_linear]"></div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-10 text-center pointer-events-none gap-4">
                                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-500">
                                        <UploadCloud className="w-8 h-8 text-emerald-500/50" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-bold text-zinc-300 font-mono uppercase tracking-wider">Feed the Machine</h3>
                                        <p className="text-sm text-zinc-500 font-mono">Upload JPG, PNG, WEBP (Max 20MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {previewUrl && !isAnalyzing && (
                            <div className="flex gap-4">
                                <Button onClick={reset} variant="outline" className="h-14 flex-1 rounded-2xl border-zinc-800 bg-zinc-900 hover:bg-zinc-800 font-mono text-xs tracking-widest uppercase">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Reset
                                </Button>
                                <Button onClick={() => setCropModalOpen(true)} variant="outline" className="h-14 flex-1 rounded-2xl border-zinc-800 bg-zinc-900 hover:bg-zinc-800 font-mono text-xs tracking-widest uppercase">
                                    <CropIcon className="w-4 h-4 mr-2" /> Crop
                                </Button>
                                <Button onClick={handleAnalyze} className="h-14 flex-[2] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    Extract DNA
                                </Button>
                            </div>
                        )}
                        
                        {error && (
                            <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-2xl text-red-400 text-xs font-mono flex items-center gap-3">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>

                    {/* DNA Analysis & Matches Section */}
                    <div className="w-full flex flex-col gap-8">
                        {!result && !isAnalyzing ? (
                            <div className="w-full h-full rounded-[2rem] border border-zinc-900 bg-zinc-900/20 flex flex-col items-center justify-center p-12 text-center gap-5 min-h-[400px]">
                                <Fingerprint className="w-16 h-16 text-zinc-800" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold font-mono uppercase text-zinc-600">Aura Inactive</h3>
                                    <p className="text-sm text-zinc-700 font-mono max-w-xs leading-relaxed">System offline. Please input visual data to begin aesthetic extraction.</p>
                                </div>
                            </div>
                        ) : (
                            <div id="dna-results" className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                {/* extracted DNA */}
                                {result && (
                                    <div className="p-8 rounded-[2rem] bg-zinc-900/80 border border-emerald-500/10 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                        
                                        <div className="flex flex-col gap-6 relative z-10">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                                                    <Sparkles className="w-3 h-3" />
                                                    Vibe Detection
                                                </div>
                                                <p className="text-xl italic font-serif text-white opacity-90 leading-relaxed">
                                                    "{result.vibe_summary}"
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest font-black">Digital Fingerprint</div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border-emerald-400/20 font-mono text-xs tracking-tighter rounded-lg">
                                                        {result.primary_category}
                                                    </Badge>
                                                    {result.aesthetic_tags.map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="px-3 py-1.5 border-zinc-700 bg-zinc-800/50 text-zinc-400 font-mono text-xs tracking-tighter rounded-lg">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Marketplace Matches */}
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                        <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-black text-white/50">Marketplace Matches</h3>
                                        {isFetchingMatches && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
                                    </div>

                                    {matches.length === 0 && !isFetchingMatches ? (
                                        <div className="py-12 text-center font-mono text-zinc-600 text-sm italic">
                                            No direct matches in the currently sequenced profile.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            {matches.map((prompt) => (
                                                <div key={prompt.id} className="scale-95 hover:scale-100 transition-transform duration-500">
                                                    <PromptCard prompt={prompt} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cropper Modal */}
            <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
                <DialogContent className="max-w-3xl w-[95vw] bg-zinc-950 border-zinc-800 rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="font-mono text-xl uppercase tracking-widest text-emerald-400">Target Vibe</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black flex justify-center items-center min-h-[300px]">
                        {previewUrl && (
                            <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)}>
                                <img ref={imgRef} alt="Crop" src={previewUrl} onLoad={onImageLoad} style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter className="mt-6 flex gap-3">
                        <Button variant="ghost" onClick={() => setCropModalOpen(false)} className="text-zinc-500 hover:text-white">Skip</Button>
                        <Button onClick={handleCropComplete} className="bg-emerald-500 text-emerald-950 font-black tracking-widest uppercase">Analyze Selection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @keyframes dna-scan {
                    0% { transform: translateY(-100%)}
                    100% { transform: translateY(100%)}
                }
                @keyframes dna-load {
                    0% { left: -50% }
                    100% { left: 100% }
                }
            `}</style>
        </div>
    )
}
