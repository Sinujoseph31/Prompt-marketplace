'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, PlayCircle, CheckCircle2 } from 'lucide-react'
import { awardPoints } from '@/app/actions/points'
import { useRouter } from 'next/navigation'

interface RewardAdModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export default function RewardAdModal({ open, onOpenChange, onSuccess }: RewardAdModalProps) {
    const [status, setStatus] = useState<'idle' | 'playing' | 'completed' | 'error'>('idle')
    const [timeLeft, setTimeLeft] = useState(5)
    const router = useRouter()

    useEffect(() => {
        if (!open) {
            // Reset when closed
            setTimeout(() => {
                setStatus('idle')
                setTimeLeft(5)
            }, 500)
        }
    }, [open])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (status === 'playing' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
        } else if (status === 'playing' && timeLeft === 0) {
            finishAd()
        }
        return () => clearTimeout(timer)
    }, [status, timeLeft])

    const startAd = () => {
        setStatus('playing')
        setTimeLeft(5)
    }

    const finishAd = async () => {
        try {
            const result = await awardPoints(20)
            if (result.success) {
                setStatus('completed')
                router.refresh()
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess()
                    }, 2000)
                }
            } else {
                setStatus('error')
            }
        } catch (error) {
            setStatus('error')
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            // Don't allow closing while playing
            if (status === 'playing') return
            onOpenChange(val)
        }}>
            <DialogContent className="sm:max-w-md bg-zinc-950 text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Watch Ad for Points</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Watch a quick ad to earn 20 points!
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-8 min-h-[300px] bg-zinc-900 rounded-lg border border-zinc-800 relative overflow-hidden">
                    {status === 'idle' && (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <PlayCircle className="w-16 h-16 text-amber-500" />
                            <p className="text-zinc-300 text-center px-6">
                                Ready to earn? Click below to start watching a sponsored ad.
                            </p>
                            <Button 
                                onClick={startAd}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 mt-4"
                            >
                                Start Ad
                            </Button>
                        </div>
                    )}

                    {status === 'playing' && (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300 w-full h-full justify-center">
                            {/* Simulated Video Area */}
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="text-4xl font-mono font-bold text-white bg-zinc-800/80 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-amber-500/50 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-amber-500/20 animate-pulse"></div>
                                        <span className="relative z-10">{timeLeft}</span>
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight text-amber-400">Sponsored View</h3>
                                    <p className="text-sm text-zinc-400 max-w-[200px] mx-auto">
                                        Please wait while your reward is being prepared...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="bg-green-500/20 p-4 rounded-full">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Reward Earned!</h3>
                            <p className="text-green-400 font-medium">
                                +20 Points added to your balance
                            </p>
                            <Button 
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="mt-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-red-400 font-medium">Something went wrong.</p>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setStatus('idle')
                                    setTimeLeft(5)
                                }}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
