'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { MovieScene, RightsStatus } from '@/types/movie-scenes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ExternalLink, 
    Bookmark, 
    Clapperboard, 
    Sparkles, 
    Clock, 
    Users, 
    Quote, 
    Play, 
    Pause,
    Volume2,
    VolumeX,
    Type
} from 'lucide-react';

interface SceneCardProps {
    scene: MovieScene;
    isSaved?: boolean;
    onToggleSave?: (scene: MovieScene) => void;
    onCreateReel?: (scene: MovieScene) => void;
}

export function SceneCard({ scene, isSaved = false, onToggleSave, onCreateReel }: SceneCardProps) {
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePreviewPlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (isPlayingPreview) {
            videoRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlayingPreview(true);
                    })
                    .catch((err) => {
                        console.warn('Card preview playback prevented:', err);
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            videoRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => {});
                        }
                    });
            }
        }
    };

    const getRightsBadge = (status: RightsStatus) => {
        switch (status) {
            case 'licensed':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        🟢 Licensed Clip
                    </Badge>
                );
            case 'user_uploaded':
                return (
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        🔵 User Uploaded
                    </Badge>
                );
            case 'external':
            default:
                return (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        🟡 Web Discovery Clip
                    </Badge>
                );
        }
    };

    return (
        <div className="group relative rounded-3xl border bg-card hover:border-primary/40 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
            {/* Top Media Header / Video Player Preview */}
            <div 
                className="relative w-full h-56 sm:h-60 bg-black overflow-hidden cursor-pointer"
                onClick={togglePreviewPlay}
            >
                {scene.videoUrl ? (
                    <video
                        ref={videoRef}
                        src={scene.videoUrl}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        poster={scene.backdrop || scene.poster}
                    />
                ) : (
                    <Image
                        src={scene.backdrop || scene.poster}
                        alt={scene.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />

                {/* Top overlay badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    {getRightsBadge(scene.rightsStatus)}
                    {scene.relevanceScore !== undefined && scene.relevanceScore > 0 && (
                        <Badge className="bg-primary/90 text-primary-foreground font-bold shadow-md backdrop-blur-md text-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {scene.relevanceScore}% Match
                        </Badge>
                    )}
                </div>

                {/* Center Play Indicator */}
                {scene.videoUrl && (
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10 ${
                        isPlayingPreview ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                    }`}>
                        <div className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                            {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                        </div>
                    </div>
                )}

                {/* Movie Title & Info floating in bottom banner */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between z-10 pointer-events-none">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary mb-0.5">
                            <span>{scene.language}</span>
                            <span>•</span>
                            <span>{scene.year}</span>
                            <span>•</span>
                            <span>{scene.country}</span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-lg text-white drop-shadow-md line-clamp-1">
                            {scene.movieTitle} {scene.originalMovieTitle && <span className="text-xs font-medium text-white/80">({scene.originalMovieTitle})</span>}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white bg-black/70 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{scene.duration}s</span>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                    {/* Match Reason if present */}
                    {scene.matchReason && (
                        <div className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span>{scene.matchReason}</span>
                        </div>
                    )}

                    {/* Scene Title */}
                    <h4 className="font-bold text-base text-foreground leading-snug">
                        {scene.title}
                    </h4>

                    {/* Scene Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {scene.description}
                    </p>

                    {/* Dialogue Snippet */}
                    {scene.dialogue && (
                        <div className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-xs italic text-foreground/90 flex items-start gap-2">
                            <Quote className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-2">"{scene.dialogue}"</span>
                        </div>
                    )}

                    {/* Actor Tags */}
                    {scene.actors && scene.actors.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
                            <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="font-medium">{scene.actors.join(', ')}</span>
                        </div>
                    )}

                    {/* Category & Emotion Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {scene.categories.slice(0, 3).map((cat) => (
                            <span key={cat} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                                {cat}
                            </span>
                        ))}
                        {scene.emotions.slice(0, 2).map((emo) => (
                            <span key={emo} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                                {emo}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                    {/* Primary Remake Reel Button */}
                    <Button
                        size="sm"
                        onClick={() => onCreateReel && onCreateReel(scene)}
                        className="w-full text-xs font-bold rounded-2xl gap-2 h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:scale-[1.01] transition-transform"
                    >
                        <Clapperboard className="w-4 h-4" />
                        <span>🎬 Remake This Clip (Add Text / Reel 9:16)</span>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Watch Original */}
                        {scene.sourceUrl ? (
                            <a
                                href={scene.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-xl gap-1.5 h-8">
                                    <Play className="w-3 h-3 text-rose-500 fill-rose-500" />
                                    <span>Watch Clip</span>
                                </Button>
                            </a>
                        ) : (
                            <Button variant="outline" size="sm" disabled className="w-full text-xs font-semibold rounded-xl gap-1.5 h-8 opacity-50">
                                <span>No External Link</span>
                            </Button>
                        )}

                        {/* Save Button */}
                        <Button
                            variant={isSaved ? "default" : "secondary"}
                            size="sm"
                            onClick={() => onToggleSave && onToggleSave(scene)}
                            className={`w-full text-xs font-semibold rounded-xl gap-1.5 h-8 transition-all ${
                                isSaved ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                            }`}
                        >
                            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
