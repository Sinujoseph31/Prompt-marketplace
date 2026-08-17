'use client'

import * as React from "react"
import Link from "next/link"
import { Sparkles, Dices, Flame, ImageIcon, SmilePlus, MoonStar, ScanSearch, Fingerprint, UserCheck, Activity, ShoppingBag, Video, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tools = [
    {
        title: "Video Clips Vault",
        href: "/movie-scene-finder",
        description: "Browse & download movie moments, meme reactions & viral clips",
        icon: Film,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
    },
    {
        title: "Reels Architect",
        href: "/ai-tools/reels-architect",
        description: "Viral hooks & AI video storyboard studio",
        icon: Video,
        color: "text-rose-500",
        bgColor: "bg-rose-500/10"
    },
    {
        title: "Product Studio",
        href: "/ai-tools/product-studio",
        description: "Luxury commercial e-commerce ads",
        icon: ShoppingBag,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10"
    },
    {
        title: "Prompt Doctor",
        href: "/ai-tools/prompt-doctor",
        description: "Benchmark score & token optimization",
        icon: Activity,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10"
    },
    {
        title: "Character Studio",
        href: "/ai-tools/character-studio",
        description: "Zero-drift multi-scene avatar prompts",
        icon: UserCheck,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10"
    },
    {
        title: "Reverse Engineer",
        href: "/ai-tools/reverse-engineer",
        description: "Deconstruct image DNA to prompts",
        icon: ScanSearch,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10"
    },
    {
        title: "Image To Prompt",
        href: "/ai-tools/image-to-prompt",
        description: "Stylized image idea generator",
        icon: ImageIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    {
        title: "Roast My Prompt",
        href: "/ai-tools/roast-my-prompt",
        description: "AI critic & god-tier editor",
        icon: Flame,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10"
    },
    {
        title: "Chaos Generator",
        href: "/ai-tools/chaos-generator",
        description: "Randomized prompt seed",
        icon: Dices,
        color: "text-fuchsia-500",
        bgColor: "bg-fuchsia-500/10"
    },
    {
        title: "Meme Architect",
        href: "/ai-tools/meme-architect",
        description: "Viral meme ideator & prompt",
        icon: SmilePlus,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10"
    },
    {
        title: "AI Vibe Check",
        href: "/ai-tools/vibe-check",
        description: "Mystical aura reading",
        icon: MoonStar,
        color: "text-indigo-400",
        bgColor: "bg-indigo-400/10"
    },
    {
        title: "Aesthetic DNA Search",
        href: "/ai-tools/aesthetic-dna",
        description: "Find matching vibes in store",
        icon: Fingerprint,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
    }
]

export function AIToolsDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-semibold px-2 sm:px-3">
                    <Sparkles className="w-4 h-4 sm:mr-2 text-primary" />
                    <span className="hidden sm:inline">AI Labs</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" alignOffset={-10} className="z-[100] w-[320px] sm:w-[380px] p-2 rounded-2xl shadow-2xl mt-2 border border-border/50 bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col gap-1 w-full">
                    {tools.map((tool) => (
                        <DropdownMenuItem key={tool.title} asChild className="rounded-xl cursor-pointer p-0 focus:bg-muted/60 transition-all w-full group">
                            <Link href={tool.href} className="flex items-start sm:items-center gap-4 w-full p-3 sm:p-4 outline-none">
                                <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-focus:scale-110 ${tool.bgColor}`}>
                                    <tool.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${tool.color}`} />
                                </div>
                                <div className="flex flex-col flex-1 pl-1">
                                    <span className="font-bold text-sm sm:text-base text-foreground transition-colors group-hover:text-primary group-focus:text-primary mb-0.5">
                                        {tool.title}
                                    </span>
                                    <span className="text-xs sm:text-sm text-muted-foreground opacity-90 leading-relaxed font-medium transition-colors group-hover:text-foreground/80 group-focus:text-foreground/80">
                                        {tool.description}
                                    </span>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
