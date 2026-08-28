'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Check, Copy, Sparkles, Terminal } from 'lucide-react'
import { getAiInterfaceUrl } from '@/utils/ai-interfaces'

interface RevealPromptProps {
    promptId: string
    fullPrompt: string
    category: string
    subcategory?: string
}

export default function RevealPrompt({
    fullPrompt,
    category,
    subcategory
}: RevealPromptProps) {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullPrompt)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    const aiUrl = getAiInterfaceUrl(fullPrompt, category, subcategory)

    return (
        <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-bold">Prompt Instructions</h2>
                </div>
                <div className="flex gap-2 shrink-0">
                    {aiUrl && (
                        <a href={aiUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium text-xs h-9"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Launch in AI</span>
                            </Button>
                        </a>
                    )}
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 font-bold text-xs h-9 transition-all ${
                            isCopied
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied to Clipboard!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Prompt</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="relative group rounded-2xl bg-muted/60 dark:bg-zinc-950/80 border border-border/80 p-5 overflow-hidden shadow-inner">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-sm border text-[10px] font-mono text-muted-foreground">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>{category || 'AI Prompt'}</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground select-all pt-2 pb-1">
                    {fullPrompt}
                </pre>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>⚡ {fullPrompt.length} characters</span>
                <span>💡 Works with {category || 'ChatGPT / Midjourney'}</span>
            </div>
        </div>
    )
}
