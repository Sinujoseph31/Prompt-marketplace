'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Zap, Flame, Users, Timer, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Activity = {
    id: string;
    type: 'new_prompt' | 'trending' | 'cooking';
    user: string;
    targetName: string;
    timestamp: string;
    imageUrl?: string;
    relativeTime: string;
}

export default function SocialActivityFeed({ initialPrompts = [] }: { initialPrompts?: any[] }) {
    const [activities, setActivities] = useState<Activity[]>([])

    useEffect(() => {
        // Transform real prompts into "Just Cooked" activities
        const realActivities: Activity[] = initialPrompts.slice(0, 3).map(p => ({
            id: p.id,
            type: 'new_prompt',
            user: p.profiles?.name || 'A Seller',
            targetName: p.title,
            timestamp: new Date().toISOString(),
            imageUrl: p.preview_image,
            relativeTime: 'Just now'
        }))

        // Add some "Live" mocked activities for the vibe
        const mockedActivities: Activity[] = [
            {
                id: 'mock-1',
                type: 'cooking',
                user: 'PromptMaster',
                targetName: 'Cyberpunk Volumetric Lighting',
                timestamp: new Date().toISOString(),
                relativeTime: 'Live'
            },
            {
                id: 'mock-2',
                type: 'trending',
                user: 'Community',
                targetName: 'Vintage Polaroid Style',
                timestamp: new Date().toISOString(),
                relativeTime: '2m ago'
            }
        ]

        setActivities([...realActivities, ...mockedActivities])
    }, [initialPrompts])

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">Marketplace Pulse</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" />
                    <span>248 Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activities.map((item, idx) => (
                    <div 
                        key={item.id} 
                        className={`
                            group relative p-4 rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20 overflow-hidden
                            ${idx === 0 ? 'animate-in fade-in slide-in-from-left-4 duration-500' : ''}
                        `}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 pt-2 pr-4">
                           {item.type === 'cooking' ? (
                               <div className="flex items-center gap-1 text-[9px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-500/20">
                                   <Flame className="w-2 h-2 animate-pulse" />
                                   Cooking
                               </div>
                           ) : item.type === 'trending' ? (
                               <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-500/20">
                                   <Zap className="w-2 h-2" />
                                   Trending
                               </div>
                           ) : (
                               <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                   <Sparkles className="w-2 h-2" />
                                   Fresh
                               </div>
                           )}
                        </div>

                        <div className="flex gap-4 items-center">
                            {item.imageUrl ? (
                                <div className="w-12 h-12 rounded-xl overflow-hidden border bg-muted relative shrink-0">
                                    <Image src={item.imageUrl} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <Timer className="w-5 h-5 text-muted-foreground/50" />
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                     <span className="text-xs font-bold text-foreground truncate">{item.user}</span>
                                     <span className="text-[10px] text-muted-foreground whitespace-nowrap">• {item.relativeTime}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-foreground/80 truncate pr-16 group-hover:text-primary transition-colors">
                                    {item.type === 'new_prompt' ? 'Listed ' : item.type === 'cooking' ? 'Optimizing ' : 'Popular: '}
                                    {item.targetName}
                                </h4>
                            </div>

                            {item.type === 'new_prompt' && (
                                <Link 
                                    href={`/prompt/${item.id}`}
                                    className="absolute inset-0 z-10"
                                    aria-label="View prompt"
                                />
                            )}
                            
                            <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Hover Decoration */}
                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}
