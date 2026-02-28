'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Play, Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TestPromptPlayground({ fullPrompt, category }: { fullPrompt: string, category: string }) {
    const [testPrompt, setTestPrompt] = useState(fullPrompt)
    const [result, setResult] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isImageModel = category === 'DALL‑E Prompts' || category === 'MidJourney Prompts' || category === 'Stable Diffusion Prompts' || category?.includes('Art') || category?.includes('Photography') || category?.includes('Graphics') || category?.includes('Logos');

    const handleTest = async () => {
        if (!testPrompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            if (isImageModel) {
                // Use Together AI route for image generation preview
                const params = new URLSearchParams({ prompt: testPrompt });
                const res = await fetch(`/api/generate-image?${params.toString()}`);

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to generate image preview');
                }

                // Get the raw image blob
                const blob = await res.blob();
                const objUrl = URL.createObjectURL(blob);
                setResult(objUrl);
            } else {
                // Use Gemini via a new API route for text generation preview
                const res = await fetch('/api/test-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: testPrompt })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to test text prompt');
                }

                const data = await res.json();
                setResult(data.result);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during testing.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-4 mt-6 border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="bg-muted/50 p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Playground: Test it Live</h3>
                </div>
                <Badge variant={isImageModel ? "secondary" : "outline"} className="text-xs">
                    {isImageModel ? 'Image Preview (FLUX)' : 'Text Preview (Gemini)'}
                </Badge>
            </div>

            <div className="p-4 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                    Try modifying the variables or text below to see how this prompt performs.
                </p>

                <Textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="min-h-[120px] font-mono text-sm bg-muted/20 resize-y"
                    placeholder="Enter prompt text here..."
                />

                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTestPrompt(fullPrompt)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset to Original
                    </Button>

                    <Button
                        onClick={handleTest}
                        disabled={isLoading || !testPrompt.trim()}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        Run Prompt
                    </Button>
                </div>
            </div>

            {/* Results Area */}
            {(result || error || isLoading) && (
                <div className="bg-muted/30 border-t p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Output Preview</span>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm">Running your prompt through AI...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="mt-2 bg-background border rounded-lg p-1 overflow-hidden">
                            {isImageModel ? (
                                <div className="flex justify-center bg-muted/20">
                                    <img src={result} alt="Generated Preview" className="max-w-full h-auto max-h-[500px] object-contain rounded-md" />
                                </div>
                            ) : (
                                <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm bg-transparent !p-0 !m-0">
                                        {result}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
