'use client'

import React, { useState, useRef } from 'react';
import { 
    VIDEO_CLIPS_COLLECTION, 
    VideoClip, 
    getClipsByCategory, 
    searchClipsCollection 
} from '@/lib/movie-scenes/clips-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Download,
    Copy,
    Check,
    Film,
    Laugh,
    Gamepad2,
    Car,
    Dumbbell,
    Clapperboard,
    Sparkles,
    Eye,
    X,
    Bookmark,
    ArrowUpRight,
    Clock,
    Share2,
    Maximize2
} from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: '🔥 All Clips', icon: Film },
    { id: 'cinema_regional', label: '🎬 Cinema & Movies', icon: Clapperboard },
    { id: 'meme_reaction', label: '😂 Meme Reactions', icon: Laugh },
    { id: 'gaming_satisfying', label: '🎮 GTA & Satisfying', icon: Gamepad2 },
    { id: 'aesthetic_drive', label: '🌆 Aesthetic & Drives', icon: Car },
    { id: 'gym_motivation', label: '⚡ Gym & Motivation', icon: Dumbbell },
];

const SEARCH_SUGGESTIONS = [
    "Sreenivasan Poland",
    "Mohanlal Spadikam",
    "Pedro Pascal Crying",
    "GTA 5 Mega Ramp",
    "Patrick Bateman Sigma",
    "Subway Surfers",
    "Walter White Collapse",
    "Joker Dark Knight",
    "Cyberpunk Night Drive",
    "Malayalam comedy paisa"
];

export default function VideoClipsVaultPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeModalClip, setActiveModalClip] = useState<VideoClip | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [savedClipIds, setSavedClipIds] = useState<Set<string>>(new Set());

    // Filtered clips
    const displayedClips = searchClipsCollection(searchQuery, selectedCategory);

    const handleCopyLink = (clip: VideoClip, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(clip.videoUrl);
        setCopiedId(clip.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleSave = (clipId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSavedClipIds(prev => {
            const next = new Set(prev);
            if (next.has(clipId)) next.delete(clipId);
            else next.add(clipId);
            return next;
        });
    };

    return (
        <div className="w-full flex flex-col min-h-screen items-center bg-background text-foreground selection:bg-primary/20 pb-28">
            
            {/* Hero Header */}
            <div className="w-full max-w-7xl px-5 pt-10 md:pt-16 pb-8 flex flex-col items-center text-center gap-4 relative">
                
                {/* Decorative Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-primary/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
                    <Film className="w-3.5 h-3.5" />
                    <span>Video Clips Vault • HD & 4K Downloads</span>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl leading-[1.15]">
                    Video Clips <span className="bg-gradient-to-r from-primary via-purple-500 to-rose-500 bg-clip-text text-transparent">Collection</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Browse, search, and download video clips from cinema, viral meme reactions, GTA gameplay, and aesthetic footage.
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-3xl mt-4 relative flex items-center gap-2 p-2 rounded-full bg-card border-2 border-border/80 hover:border-primary/50 shadow-2xl focus-within:border-primary transition-all duration-300">
                    <div className="flex items-center gap-3 flex-1 px-4">
                        <Search className="w-5 h-5 text-primary shrink-0" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by movie, dialogue, actor, meme (e.g. Sreenivasan, GTA, Pedro Pascal)..."
                            className="border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base font-medium placeholder:text-muted-foreground/60 p-0 h-auto bg-transparent"
                        />
                    </div>
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="rounded-full h-8 px-3 text-xs"
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {/* Search Suggestions */}
                <div className="w-full max-w-4xl mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        Popular:
                    </span>
                    {SEARCH_SUGGESTIONS.map((tag, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="text-xs font-semibold px-3 py-1 rounded-full border bg-muted/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-muted-foreground"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Filter Navigation Bar */}
            <div className="w-full max-w-7xl px-5 mb-8">
                <div className="flex items-center justify-between gap-4 border-b pb-4 flex-wrap">
                    
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                }}
                                className={`text-xs font-bold px-4 py-2.5 rounded-full transition-all shrink-0 flex items-center gap-2 ${
                                    selectedCategory === cat.id
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-card border hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <cat.icon className="w-3.5 h-3.5" />
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Results Counter */}
                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <Badge className="bg-primary/10 text-primary font-bold">
                            {displayedClips.length} {displayedClips.length === 1 ? 'clip' : 'clips'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Video Clips Grid */}
            <div className="w-full max-w-7xl px-5 flex-1">
                {displayedClips.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-card/40 p-8 max-w-lg mx-auto space-y-4">
                        <Film className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                        <h3 className="text-lg font-bold text-foreground">No video clips found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Try searching for something else like "GTA", "Sreenivasan", "Pedro Pascal", or "Joker".
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="rounded-full text-xs"
                        >
                            Reset Search
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedClips.map((clip) => (
                            <VideoCard
                                key={clip.id}
                                clip={clip}
                                isSaved={savedClipIds.has(clip.id)}
                                isCopied={copiedId === clip.id}
                                onOpenModal={() => setActiveModalClip(clip)}
                                onCopyLink={(e) => handleCopyLink(clip, e)}
                                onToggleSave={(e) => toggleSave(clip.id, e)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Theatre Video Modal Lightbox */}
            {activeModalClip && (
                <div 
                    className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
                    onClick={() => setActiveModalClip(null)}
                >
                    <div 
                        className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-primary/20 text-primary text-xs font-bold">
                                    {activeModalClip.categoryLabel}
                                </Badge>
                                {activeModalClip.quality && (
                                    <Badge className="bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                                        {activeModalClip.quality}
                                    </Badge>
                                )}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setActiveModalClip(null)}
                                className="rounded-full text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Large Theatre Video Player */}
                        <div className="relative w-full bg-black aspect-video flex items-center justify-center">
                            <video
                                src={activeModalClip.videoUrl}
                                controls
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Modal Details & Action Footer */}
                        <div className="p-6 bg-neutral-900 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-black text-xl text-white">
                                        {activeModalClip.title}
                                    </h3>
                                    {activeModalClip.movieOrShow && (
                                        <p className="text-xs text-primary font-bold mt-0.5">
                                            From: {activeModalClip.movieOrShow} {activeModalClip.language ? `• ${activeModalClip.language}` : ''}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleCopyLink(activeModalClip, e)}
                                        className="rounded-2xl text-xs font-semibold gap-1.5 h-10 border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
                                    >
                                        {copiedId === activeModalClip.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        <span>{copiedId === activeModalClip.id ? 'Copied' : 'Copy Link'}</span>
                                    </Button>

                                    <a
                                        href={activeModalClip.videoUrl}
                                        download={`${activeModalClip.title.toLowerCase().replace(/\s+/g, '-')}.mp4`}
                                    >
                                        <Button
                                            size="sm"
                                            className="rounded-2xl text-xs font-bold gap-2 h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download MP4</span>
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            {activeModalClip.description && (
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    {activeModalClip.description}
                                </p>
                            )}

                            {activeModalClip.dialogue && (
                                <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-xs italic text-neutral-200">
                                    "{activeModalClip.dialogue}"
                                </div>
                            )}

                            {/* Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {activeModalClip.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface VideoCardProps {
    clip: VideoClip;
    isSaved: boolean;
    isCopied: boolean;
    onOpenModal: () => void;
    onCopyLink: (e: React.MouseEvent) => void;
    onToggleSave: (e: React.MouseEvent) => void;
}

function VideoCard({ clip, isSaved, isCopied, onOpenModal, onCopyLink, onToggleSave }: VideoCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (!videoRef.current) return;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        if (!videoRef.current) return;
        videoRef.current.pause();
        setIsPlaying(false);
    };

    return (
        <div 
            onClick={onOpenModal}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative rounded-3xl border bg-card hover:border-primary/50 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
        >
            {/* Video Player Box */}
            <div className="relative w-full aspect-video bg-black overflow-hidden">
                <video
                    ref={videoRef}
                    src={clip.videoUrl}
                    poster={clip.thumbnailUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loop
                    playsInline
                    muted
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <Badge className="bg-black/70 backdrop-blur text-white text-[10px] font-bold border-0">
                        {clip.categoryLabel}
                    </Badge>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur">
                            {clip.quality}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-primary" />
                            {clip.duration}
                        </span>
                    </div>
                </div>

                {/* Play Button Icon on Hover */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
                    isPlaying ? 'opacity-0' : 'opacity-100'
                }`}>
                    <div className="h-12 w-12 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Card Content & Details */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                    {clip.movieOrShow && (
                        <div className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                            <span>{clip.movieOrShow}</span>
                            {clip.language && <span>• {clip.language}</span>}
                        </div>
                    )}

                    <h3 className="font-extrabold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {clip.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {clip.description}
                    </p>

                    {clip.dialogue && (
                        <p className="text-xs italic text-foreground/80 bg-muted/50 p-2 rounded-xl border border-border/50 line-clamp-1">
                            "{clip.dialogue}"
                        </p>
                    )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleSave}
                            className="h-8 w-8 rounded-full"
                            title="Save Clip"
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onCopyLink}
                            className="h-8 w-8 rounded-full"
                            title="Copy Clip Link"
                        >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                    </div>

                    <a
                        href={clip.videoUrl}
                        download={`${clip.title.toLowerCase().replace(/\s+/g, '-')}.mp4`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            size="sm"
                            className="rounded-xl text-xs font-bold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download MP4</span>
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
