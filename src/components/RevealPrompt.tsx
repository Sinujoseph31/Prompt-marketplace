'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function RevealPrompt({ fullPrompt }: { fullPrompt: string }) {
    const [revealed, setRevealed] = useState(false)

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
            <h2 className="text-xl font-semibold">The Prompt</h2>
            <div className="p-6 bg-muted rounded-lg border border-border">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {fullPrompt}
                </pre>
            </div>
        </div>
    )
}
