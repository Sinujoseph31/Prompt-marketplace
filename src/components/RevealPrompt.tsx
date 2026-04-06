'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { checkRevealStatus, revealPrompt, getUserPoints } from '@/app/actions/points'
import { Loader2, Coins, ExternalLink } from 'lucide-react'
import RewardAdModal from './RewardAdModal'
import { getAiInterfaceUrl } from '@/utils/ai-interfaces'

export default function RevealPrompt({ promptId, fullPrompt, category, subcategory }: { promptId: string, fullPrompt: string, category: string, subcategory?: string }) {
    const [revealed, setRevealed] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [statusLoading, setStatusLoading] = useState(true)
    const [revealLoading, setRevealLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showAdModal, setShowAdModal] = useState(false)


    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await checkRevealStatus(promptId)
                if (res.success && res.revealed) {
                    setRevealed(true)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setStatusLoading(false)
            }
        }
        fetchStatus()
    }, [promptId])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullPrompt)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    const handleReveal = async () => {
        setError(null)
        setRevealLoading(true)
        try {
            const result = await revealPrompt(promptId)
            
            if (result.success) {
                setRevealed(true)
            } else {
                if (result.error === 'Insufficient points') {
                    setError('Not enough points to reveal limit! You need 10 points.')
                    setShowAdModal(true)
                } else if (result.error === 'Already revealed') {
                    setRevealed(true)
                } else {
                    setError(result.error || 'Failed to reveal prompt')
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setRevealLoading(false)
        }
    }

    if (statusLoading) {
        return (
            <div className="mt-8 flex items-center justify-center p-12 bg-muted/50 rounded-lg border border-dashed border-foreground/20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const aiUrl = getAiInterfaceUrl(fullPrompt, category, subcategory)

    if (!revealed) {
        return (
            <div className="mt-8 flex flex-col items-center justify-center p-12 bg-muted/50 rounded-lg border border-dashed text-center">
                <RewardAdModal open={showAdModal} onOpenChange={setShowAdModal} onSuccess={() => setError(null)} />
                <h3 className="text-xl font-bold mb-2">Ready to see the prompt?</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                    Unlock full access to this prompt. It costs 10 points to reveal.
                </p>
                {error && <p className="text-red-500 font-medium mb-4 text-sm">{error}</p>}
                
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <Button 
                        size="lg" 
                        onClick={handleReveal} 
                        disabled={revealLoading}
                        className="font-bold relative flex items-center gap-2"
                    >
                        {revealLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                        {revealLoading ? 'Revealing...' : 'Reveal Prompt (10 Points)'}
                    </Button>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdModal(true)}
                        className="text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        Earn Points (Watch Ad)
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">The Prompt</h2>
                <div className="flex gap-2 shrink-0">
                    {aiUrl && (
                        <a href={aiUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Try on AI</span>
                            </Button>
                        </a>
                    )}
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
            </div>
            <div className="p-6 bg-muted rounded-lg border border-border">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {fullPrompt}
                </pre>
            </div>
        </div>
    )
}
