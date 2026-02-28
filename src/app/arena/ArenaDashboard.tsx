'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { submitBattleEntry, toggleUpvote, type Battle, type BattleEntry } from '@/app/actions/battles'
import { Flame, Trophy, Swords, ArrowBigUp, Loader2, Link as LinkIcon } from 'lucide-react'

export default function ArenaDashboard({
    battle,
    entries: initialEntries,
    userHasEntered,
    isLoggedIn
}: {
    battle: Battle;
    entries: BattleEntry[];
    userHasEntered: boolean;
    isLoggedIn: boolean;
}) {
    const [entries, setEntries] = useState(initialEntries)
    const [hasEntered, setHasEntered] = useState(userHasEntered)

    // Submission state
    const [promptText, setPromptText] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Upvote state (optimistic UI)
    const [votingId, setVotingId] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoggedIn) {
            setSubmitError("You must be logged in to fight in the Arena.")
            return;
        }

        setIsSubmitting(true)
        setSubmitError(null)

        const { error } = await submitBattleEntry(battle.id, promptText, imageUrl)

        if (error) {
            setSubmitError(error)
            setIsSubmitting(false)
        } else {
            setHasEntered(true)
            setIsSubmitting(false)
            // Trigger a hard reload to fetch fresh leaderboard
            window.location.reload()
        }
    }

    const handleUpvote = async (entryId: string, currentlyVoted: boolean) => {
        if (!isLoggedIn) {
            alert("Log in to vote for your favorite prompts!")
            return;
        }

        setVotingId(entryId)

        // Optimistic UI update
        setEntries(currentEntries =>
            currentEntries.map(entry => {
                if (entry.id === entryId) {
                    return {
                        ...entry,
                        user_has_voted: !currentlyVoted,
                        votes_count: currentlyVoted ? entry.votes_count - 1 : entry.votes_count + 1
                    }
                }
                return entry;
            }).sort((a, b) => b.votes_count - a.votes_count) // Re-sort immediately
        )

        // Actual server call
        const { error } = await toggleUpvote(entryId)

        if (error) {
            console.error("Failed to vote:", error)
            // Ideally revert the optimistic update here if it failed
        }

        setVotingId(null)
    }

    // Format the time remaining
    const endsAt = battle.ends_at ? new Date(battle.ends_at) : null
    let timeRemaining = "Battle Ongoing"
    if (endsAt) {
        const now = new Date()
        const diffDays = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        timeRemaining = diffDays > 0 ? `${diffDays} days left` : "Ending Soon!"
    }

    return (
        <div className="w-full flex justify-center pb-24">
            <div className="w-full max-w-5xl px-5 pt-12 md:pt-16 flex flex-col gap-16">

                {/* 1. Header & Current Theme */}
                <div className="flex flex-col text-center items-center gap-6">
                    <Badge variant="outline" className="px-5 py-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/30 uppercase tracking-widest text-xs font-bold font-mono">
                        <Swords className="w-4 h-4 mr-2" />
                        Weekly Competitions
                    </Badge>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase" style={{ WebkitTextStroke: '1px var(--border)' }}>
                        Prompt <span className="text-yellow-500">Battle</span> Arena
                    </h1>

                    <div className="w-full max-w-3xl rounded-[2rem] bg-card border-2 border-foreground/10 p-8 shadow-xl mt-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>

                        <div className="flex flex-col gap-4 relative z-10">
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Theme</span>
                            <h2 className="text-3xl md:text-5xl font-black text-foreground">{battle.theme_name}</h2>
                            <p className="text-lg md:text-xl text-muted-foreground font-medium italic">"{battle.theme_description}"</p>

                            <div className="inline-flex items-center justify-center gap-2 mt-4 text-sm font-bold bg-muted/50 rounded-full px-4 py-2 self-center">
                                <Flame className="w-4 h-4 text-orange-500" />
                                {timeRemaining}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Submission Form (If haven't entered) */}
                {!hasEntered && (
                    <div className="w-full rounded-[2rem] bg-muted/20 border border-border p-8 md:p-10">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Swords className="text-primary w-6 h-6" /> Enter the Arena
                        </h3>

                        {!isLoggedIn ? (
                            <div className="text-center p-8 bg-background rounded-2xl border border-border">
                                <p className="text-lg font-medium text-muted-foreground mb-4">You must be logged in to submit a prompt or vote.</p>
                                <Button size="lg" className="rounded-full px-8" asChild>
                                    <a href="/login">Gladiator Login</a>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold tracking-wide uppercase">Your Prompt</label>
                                        <Textarea
                                            value={promptText}
                                            onChange={(e) => setPromptText(e.target.value)}
                                            placeholder="A highly detailed cinematic shot of..."
                                            className="min-h-[160px] resize-none rounded-xl text-base p-4 bg-background border-border focus-visible:ring-primary shadow-inner"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" /> Supporting Image URL (Optional)
                                        </label>
                                        <Input
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://imgur.com/your-ai-art.jpg"
                                            className="rounded-xl h-12 bg-background border-border"
                                            type="url"
                                        />
                                    </div>
                                </div>

                                {submitError && (
                                    <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{submitError}</div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !promptText.trim()}
                                    className="h-16 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-black text-xl uppercase tracking-wider transition-all hover:scale-[1.02]"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit To The Arena"}
                                </Button>
                            </form>
                        )}
                    </div>
                )}

                {hasEntered && (
                    <div className="w-full text-center p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-600 dark:text-green-400 font-bold">
                        <Trophy className="w-6 h-6 inline-block mr-2 mb-1" />
                        You have entered the Arena! May the best prompt win.
                    </div>
                )}


                {/* 3. Leaderboard Grid */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-3xl font-black uppercase tracking-tight">The Leaderboard</h3>
                        <Badge variant="secondary" className="font-mono">{entries.length} Fighters</Badge>
                    </div>

                    {entries.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-3xl">
                            No one has stepped into the arena yet. Be the first!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {entries.map((entry, index) => {
                                const isRank1 = index === 0;
                                const isRank2 = index === 1;
                                const isRank3 = index === 2;

                                return (
                                    <div key={entry.id} className={`flex gap-4 p-5 md:p-6 rounded-[2rem] border-2 bg-card shadow-sm transition-transform hover:-translate-y-1 ${isRank1 ? 'border-yellow-400 shadow-yellow-400/20' :
                                            isRank2 ? 'border-slate-300 shadow-slate-300/20' :
                                                isRank3 ? 'border-amber-600 shadow-amber-600/20' :
                                                    'border-border'
                                        }`}>

                                        {/* Voting Column */}
                                        <div className="flex flex-col items-center justify-start gap-1 w-16 shrink-0 pt-2">
                                            {isRank1 && <Trophy className="w-8 h-8 text-yellow-500 mb-2 drop-shadow-md" />}
                                            {isRank2 && <Trophy className="w-6 h-6 text-slate-400 mb-2" />}
                                            {isRank3 && <Trophy className="w-6 h-6 text-amber-700 mb-2" />}
                                            {(!isRank1 && !isRank2 && !isRank3) && <span className="font-black text-xl text-muted-foreground mb-2">#{index + 1}</span>}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleUpvote(entry.id, entry.user_has_voted || false)}
                                                disabled={votingId === entry.id || !isLoggedIn}
                                                className={`h-14 w-14 rounded-full transition-colors ${entry.user_has_voted
                                                        ? 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 border border-orange-500/30'
                                                        : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                <ArrowBigUp className={`w-8 h-8 ${entry.user_has_voted ? 'fill-current' : ''}`} />
                                            </Button>
                                            <span className="font-black text-2xl tracking-tighter mt-1">{entry.votes_count}</span>
                                        </div>

                                        {/* Entry Content */}
                                        <div className="flex flex-col gap-3 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                                                    {entry.profiles?.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="font-bold text-sm text-muted-foreground truncate flex-1">
                                                    {entry.profiles?.name || 'Unknown User'}
                                                </span>
                                            </div>

                                            <p className="font-mono text-sm md:text-base leading-relaxed p-4 bg-muted/50 rounded-xl border border-border shadow-inner break-words">
                                                {entry.prompt_text}
                                            </p>

                                            {entry.image_url && (
                                                <div className="mt-2 w-full max-h-48 rounded-xl overflow-hidden border border-border relative">
                                                    {/* Using standard img to avoid Next.js image domain configuration issues for random URLs */}
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={entry.image_url} alt="Entry Result" className="w-full h-full object-cover" loading="lazy" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
