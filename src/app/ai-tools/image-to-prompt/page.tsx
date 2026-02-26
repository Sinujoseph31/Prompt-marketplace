'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PromptResponse {
    analysis: string
    prompts: string[]
}

// Client component to handle asynchronous image loading states from third party URLs gracefully
// Client component to handle asynchronous image loading states safely
function AiGeneratedImage({ prompt }: { prompt: string }) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    // Clean up the prompt string to avoid URL parsing errors
    const cleanPrompt = prompt.replace(/\n/g, ' ').trim().substring(0, 800)

    // Secure backend route that hits HuggingFace with our private API key
    const imageUrl = `/api/generate-image?prompt=${encodeURIComponent(cleanPrompt)}`

    return (
        <div className="w-full aspect-square bg-muted relative border-b border-border/50 overflow-hidden">
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2 z-0 animate-pulse bg-muted">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-semibold">Generating Masterpiece...</span>
                </div>
            )}

            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive gap-2 z-0 bg-destructive/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="text-xs font-semibold px-4 text-center">API rate limit exceeded or model loading. Please try again.</span>
                </div>
            ) : (
                <img
                    src={imageUrl}
                    alt="AI Generated Representation"
                    className={`w-full h-full object-cover transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} relative z-10`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false)
                        setHasError(true)
                    }}
                    loading="lazy"
                />
            )}
        </div>
    )
}

export default function ImageToPromptPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<PromptResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Track which prompt index is currently copied
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                setSelectedImage(event.target.result)
                setError(null)
                // Clear previous results when a new image is selected
                setResult(null)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleGenerate = async () => {
        if (!selectedImage) return

        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/generate-prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: selectedImage }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to generate prompts.')
            }

            const data: PromptResponse = await res.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <div className="w-full flex-1 flex justify-center py-10 md:py-20 px-5 bg-muted/10">
            <div className="max-w-4xl w-full flex flex-col gap-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back Home
                    </Link>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Assistant
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Image to Prompt</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Upload an image and let our AI analyze its core subjects to generate highly creative, trending stylistic variations and prompt ideas for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Uploader */}
                    <div className="flex flex-col gap-6 bg-background rounded-3xl p-6 border shadow-sm">
                        <h2 className="text-xl font-bold">1. Upload Inspiration</h2>

                        <div
                            className={`w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer overflow-hidden relative ${selectedImage ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedImage ? (
                                <img src={selectedImage} alt="Uploaded inspiration" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium text-foreground">Click to upload image</p>
                                        <p className="text-sm">JPG, PNG or WEBP (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">{error}</p>
                        )}

                        <Button
                            className="w-full h-12 text-base font-bold shadow-md"
                            disabled={!selectedImage || isLoading}
                            onClick={handleGenerate}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing Image...
                                </>
                            ) : 'Generate Prompts'}
                        </Button>
                    </div>

                    {/* Right Column: Results */}
                    <div className="flex flex-col gap-6">
                        {!result && !isLoading ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-4 p-8 border border-dashed rounded-3xl bg-muted/20 text-muted-foreground">
                                <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                <p className="text-lg">Upload an image to reveal AI analysis and generated prompts.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-6 p-8 border rounded-3xl bg-background shadow-sm">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-muted rounded-full"></div>
                                    <div className="w-20 h-20 border-4 border-primary rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-bold animate-pulse">Running AI Analysis...</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">Our models are identifying themes, subjects, and color palettes to perfectly construct your prompt list.</p>
                                </div>
                            </div>
                        ) : result && (
                            <div className="flex flex-col gap-8 flex-1">
                                {/* Analysis Block */}
                                <div className="flex flex-col gap-3 bg-primary/5 border border-primary/20 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-2 text-primary">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        <h3 className="font-bold text-lg">AI Analysis</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/80">
                                        {result.analysis}
                                    </p>
                                </div>

                                {/* Prompts Block */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        Trending Styles
                                    </h3>

                                    <div className="flex flex-col gap-3">
                                        {result.prompts.map((promptText, idx) => (
                                            <div
                                                key={idx}
                                                className="group flex flex-col p-0 bg-background border rounded-xl hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 overflow-hidden"
                                                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                            >
                                                {/* Start: Free AI Image Generation */}
                                                <AiGeneratedImage prompt={promptText} />
                                                {/* End: Image Generation */}

                                                <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                        {promptText}
                                                    </p>
                                                    <div className="flex justify-end pt-2 border-t border-border/50">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(promptText, idx)}
                                                            className={`h-8 text-xs font-semibold flex items-center gap-1.5 transition-colors ${copiedIndex === idx ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                    Copied
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                    Copy Prompt
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
