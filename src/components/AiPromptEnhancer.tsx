'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, Check } from 'lucide-react'

export default function AiPromptEnhancer({
    fullPrompt,
    onUpdate
}: {
    fullPrompt: string,
    onUpdate: (newPrompt: string) => void
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleEnhance = async () => {
        if (!fullPrompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const res = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to enhance prompt');
            }

            const data = await res.json();
            onUpdate(data.result);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000); // Reset success state
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred while enhancing.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-2 mt-2 border rounded-xl p-4 bg-muted/20">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <h4 className="flex items-center gap-2 font-semibold text-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        AI Prompt Enhancer
                    </h4>
                    <p className="text-xs text-muted-foreground w-full max-w-sm">
                        Not sure if your prompt is clear enough? Let our AI rewrite and optimize it for better structural clarity.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEnhance}
                    disabled={isLoading || !fullPrompt.trim()}
                    className={isSuccess ? "border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600" : ""}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isSuccess ? (
                        <Check className="w-4 h-4 mr-2" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isSuccess ? 'Optimized!' : 'Enhance Prompt'}
                </Button>
            </div>
            {error && (
                <div className="text-xs text-destructive mt-1 font-medium bg-destructive/10 p-2 rounded-md">
                    Warning: {error}
                </div>
            )}
        </div>
    )
}
