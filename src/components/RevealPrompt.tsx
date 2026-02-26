'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function RevealPrompt({ fullPrompt }: { fullPrompt: string }) {
    const [revealed, setRevealed] = useState(false)
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

    if (!revealed) {
        return (
            <div className="mt-8 flex flex-col items-center justify-center p-12 bg-muted/50 rounded-lg border border-dashed border-foreground/20">
                <h3 className="text-lg font-medium mb-4">Ready to see the prompt?</h3>
                <Button size="lg" onClick={() => setRevealed(true)}>
                    Reveal Prompt
                </Button>
            </div>
        )
    }

    return (
        <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">The Prompt</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={`flex items-center gap-2 transition-all ${isCopied ? 'bg-green-500/10 text-green-600 border-green-500/50 hover:bg-green-500/20 hover:text-green-600' : ''}`}
                >
                    {isCopied ? (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy Prompt
                        </>
                    )}
                </Button>
            </div>
            <div className="p-6 bg-muted rounded-lg border border-border">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {fullPrompt}
                </pre>
            </div>
        </div>
    )
}
