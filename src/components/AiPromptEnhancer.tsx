'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Check, ImageIcon, ExternalLink } from 'lucide-react'
import { getAiInterfaceUrl } from '@/utils/ai-interfaces'

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
    const [requiresImageRef, setRequiresImageRef] = useState(false)

    const handleEnhance = async () => {
        if (!fullPrompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const res = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt, requires_image_reference: requiresImageRef })
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
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 bg-muted/50 p-3 rounded-lg border border-border">
                <div className="flex flex-1 items-center space-x-3">
                    <Switch
                        id="enhance-image-ref"
                        checked={requiresImageRef}
                        onCheckedChange={setRequiresImageRef}
                    />
                    <Label htmlFor="enhance-image-ref" className="flex items-center gap-2 cursor-pointer font-medium text-xs sm:text-sm">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        Add "Face/Structure Replacement" instructions
                    </Label>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEnhance}
                        disabled={isLoading || !fullPrompt.trim()}
                        className={isSuccess ? "border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600 w-full sm:w-auto" : "w-full sm:w-auto"}
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
                    
                    {fullPrompt.trim() && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                const url = getAiInterfaceUrl(fullPrompt);
                                if (url) window.open(url, '_blank');
                            }}
                            className="w-full sm:w-auto flex items-center gap-2"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Try on AI</span>
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-xs text-destructive mt-1 font-medium bg-destructive/10 p-2 rounded-md">
                    Warning: {error}
                </div>
            )}
        </div>
    )
}
