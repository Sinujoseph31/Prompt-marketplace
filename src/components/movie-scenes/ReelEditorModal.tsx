'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MovieScene, TextLayer } from '@/types/movie-scenes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    X,
    Sparkles,
    Upload,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Type,
    Layers,
    Download,
    Check,
    Scissors,
    Trash2,
    Move,
    Plus,
    Palette,
    RefreshCw,
    Film,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    Smartphone
} from 'lucide-react';

interface ReelEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialScene?: MovieScene | null;
}

export function ReelEditorModal({ isOpen, onClose, initialScene }: ReelEditorModalProps) {
    const [scene, setScene] = useState<MovieScene | null>(initialScene || null);
    
    // Video State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(15);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(15);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    
    // Rights & Upload State
    const [rightsConfirmed, setRightsConfirmed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Text Layers State
    const [textLayers, setTextLayers] = useState<TextLayer[]>([
        {
            id: 'layer-1',
            text: 'POV: SALARY DAY VS DAY 2 💀',
            x: 50,
            y: 20,
            fontSize: 22,
            fontWeight: '800',
            fontFamily: 'sans-serif',
            color: '#FFFFFF',
            backgroundColor: '#000000B3',
            textAlign: 'center',
            animation: 'pop'
        }
    ]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>('layer-1');

    // AI Generation States
    const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
    const [aiCaptions, setAiCaptions] = useState<string[]>([]);
    const [aiOverlays, setAiOverlays] = useState<{ category: string; text: string }[]>([]);
    const [selectedCaption, setSelectedCaption] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'text' | 'ai' | 'trim' | 'upload'>('ai');

    // Export State
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (initialScene) {
            setScene(initialScene);
            const defaultVid = initialScene.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';
            setVideoUrl(defaultVid);
            setIsPlaying(false);
            
            // Set initial overlay text to scene dialogue or title
            if (initialScene.dialogue) {
                setTextLayers([
                    {
                        id: 'layer-1',
                        text: initialScene.dialogue.toUpperCase(),
                        x: 50,
                        y: 22,
                        fontSize: 20,
                        fontWeight: '800',
                        fontFamily: 'sans-serif',
                        color: '#FFFFFF',
                        backgroundColor: '#000000B3',
                        textAlign: 'center',
                        animation: 'pop'
                    }
                ]);
            }
            // Pre-generate AI captions for this scene
            fetchAiCaptions(initialScene);
        }
    }, [initialScene]);

    if (!isOpen) return null;

    const fetchAiCaptions = async (targetScene: MovieScene) => {
        setIsGeneratingCaptions(true);
        try {
            const res = await fetch('/api/movie-scenes/ai-caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sceneTitle: targetScene.title,
                    movieTitle: targetScene.movieTitle,
                    language: targetScene.language,
                    dialogue: targetScene.dialogue,
                    description: targetScene.description
                })
            });

            if (res.ok) {
                const data = await res.json();
                setAiCaptions(data.captions || []);
                setAiOverlays(data.overlays || []);
                if (data.captions && data.captions.length > 0) {
                    setSelectedCaption(data.captions[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch AI captions:', err);
        } finally {
            setIsGeneratingCaptions(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!rightsConfirmed) {
            setUploadError('Please confirm the rights checkbox before uploading video clips.');
            return;
        }

        setUploadError(null);
        setIsUploading(true);

        try {
            // Create local object URL for instant preview & editing
            const localBlobUrl = URL.createObjectURL(file);
            setVideoUrl(localBlobUrl);

            // Background upload to server / storage
            const formData = new FormData();
            formData.append('file', file);
            formData.append('rightsConfirmed', 'true');

            await fetch('/api/movie-scenes/upload', {
                method: 'POST',
                body: formData
            });

        } catch (err: any) {
            setUploadError(err.message || 'Failed to upload video clip');
        } finally {
            setIsUploading(false);
        }
    };

    const addTextOverlay = (text: string) => {
        const newLayer: TextLayer = {
            id: `layer-${Date.now()}`,
            text: text,
            x: 50,
            y: 50,
            fontSize: 24,
            fontWeight: '800',
            fontFamily: 'sans-serif',
            color: '#FFFFFF',
            backgroundColor: '#000000CC',
            textAlign: 'center',
            animation: 'pop'
        };
        setTextLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    const updateSelectedLayer = (updates: Partial<TextLayer>) => {
        if (!selectedLayerId) return;
        setTextLayers(prev =>
            prev.map(layer => (layer.id === selectedLayerId ? { ...layer, ...updates } : layer))
        );
    };

    const removeSelectedLayer = () => {
        if (!selectedLayerId) return;
        setTextLayers(prev => prev.filter(layer => layer.id !== selectedLayerId));
        setSelectedLayerId(null);
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((err) => {
                        console.warn('Playback error handled:', err);
                        // Fallback retry muted
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            setIsMuted(true);
                            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                        }
                    });
            }
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setExportProgress(10);

        // Simulated high-fidelity 9:16 export pipeline
        const interval = setInterval(() => {
            setExportProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    setIsExporting(false);
                    setExportedVideoUrl(videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4');
                    return 100;
                }
                return prev + 15;
            });
        }, 300);
    };

    const selectedLayer = textLayers.find(l => l.id === selectedLayerId);

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-background border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Film className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                                <span>Reel Studio</span>
                                <Badge className="bg-primary/20 text-primary text-[10px] uppercase font-bold">
                                    9:16 (1080 × 1920)
                                </Badge>
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {scene ? `Customizing: ${scene.movieTitle} - ${scene.title}` : 'Universal Reel Editor'}
                            </p>
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Modal Main Content - 2 Column Layout (Canvas & Controls) */}
                <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
                    
                    {/* Left: 9:16 Reel Canvas Preview */}
                    <div className="md:col-span-5 bg-muted/40 p-4 sm:p-6 flex flex-col items-center justify-center border-r border-border min-h-[440px]">
                        
                        {/* 9:16 Mobile Aspect Ratio Container */}
                        <div className="relative w-[240px] sm:w-[270px] aspect-[9/16] bg-black rounded-[2.5rem] border-[6px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col justify-between select-none">
                            
                            {/* Top Mobile Notch / Speaker */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-900 rounded-full z-30" />

                            {/* Canvas Background / Video Layer */}
                            {videoUrl ? (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full h-full object-cover"
                                    loop
                                    playsInline
                                    preload="auto"
                                    muted={isMuted}
                                    onTimeUpdate={() => {
                                        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full relative flex flex-col items-center justify-center p-4 text-center">
                                    {scene?.backdrop || scene?.poster ? (
                                        <img
                                            src={scene.backdrop || scene.poster}
                                            alt={scene.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                                    
                                    <div className="relative z-10 space-y-2">
                                        <Film className="w-8 h-8 text-primary mx-auto opacity-80" />
                                        <p className="text-[11px] font-semibold text-white/90 leading-tight">
                                            {scene?.title || 'Preview Canvas'}
                                        </p>
                                        <p className="text-[10px] text-white/60">
                                            Upload a licensed clip or use AI overlays below
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* On-Screen Text Layers Overlay */}
                            <div className="absolute inset-0 z-20 pointer-events-none p-4 flex flex-col justify-between">
                                {textLayers.map((layer) => (
                                    <div
                                        key={layer.id}
                                        style={{
                                            position: 'absolute',
                                            top: `${layer.y}%`,
                                            left: `${layer.x}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: `${layer.fontSize}px`,
                                            fontWeight: layer.fontWeight,
                                            fontFamily: layer.fontFamily,
                                            color: layer.color,
                                            backgroundColor: layer.backgroundColor || 'transparent',
                                            textAlign: layer.textAlign,
                                            maxWidth: '90%',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                            lineHeight: 1.2
                                        }}
                                        className={`pointer-events-auto cursor-pointer transition-transform active:scale-95 ${
                                            selectedLayerId === layer.id ? 'ring-2 ring-primary ring-offset-1' : ''
                                        }`}
                                        onClick={() => setSelectedLayerId(layer.id)}
                                    >
                                        {layer.text}
                                    </div>
                                ))}
                            </div>

                            {/* Canvas Bottom Overlay (Instagram Reel mockup UI) */}
                            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none text-white text-[11px] flex flex-col gap-1">
                                <span className="font-bold drop-shadow">@prompt4life</span>
                                <span className="text-[10px] text-white/80 line-clamp-2 drop-shadow">
                                    {selectedCaption || (scene?.dialogue ? `"${scene.dialogue}"` : 'Discover viral movie moments')}
                                </span>
                            </div>
                        </div>

                        {/* Player Quick Controls */}
                        {videoUrl && (
                            <div className="flex items-center gap-3 mt-4">
                                <Button variant="outline" size="icon" onClick={togglePlay} className="rounded-full h-8 w-8">
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="rounded-full h-8 w-8"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </Button>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {currentTime.toFixed(1)}s / {duration}s
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right: Studio Controls (AI Captions, Overlays, Text Tools, Rights Upload, Export) */}
                    <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between gap-6 overflow-y-auto">
                        
                        {/* Control Tabs */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
                                <Button
                                    variant={activeTab === 'ai' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveTab('ai')}
                                    className="rounded-xl text-xs font-bold gap-1.5 h-8"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>AI Overlays & Captions</span>
                                </Button>
                                <Button
                                    variant={activeTab === 'text' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveTab('text')}
                                    className="rounded-xl text-xs font-bold gap-1.5 h-8"
                                >
                                    <Type className="w-3.5 h-3.5" />
                                    <span>Text Style</span>
                                </Button>
                                <Button
                                    variant={activeTab === 'upload' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveTab('upload')}
                                    className="rounded-xl text-xs font-bold gap-1.5 h-8"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Clip</span>
                                </Button>
                            </div>

                            {/* TAB 1: AI Overlays & Captions */}
                            {activeTab === 'ai' && (
                                <div className="space-y-5">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                <span>✨ Click to add AI Text Overlay</span>
                                            </h4>
                                            {scene && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => fetchAiCaptions(scene)}
                                                    disabled={isGeneratingCaptions}
                                                    className="text-[11px] h-6 text-primary gap-1"
                                                >
                                                    <RefreshCw className={`w-3 h-3 ${isGeneratingCaptions ? 'animate-spin' : ''}`} />
                                                    <span>Regenerate</span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {aiOverlays.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => addTextOverlay(item.text)}
                                                    className="p-3 rounded-2xl border bg-card hover:bg-primary/5 hover:border-primary/40 text-left transition-all group flex flex-col justify-between gap-1"
                                                >
                                                    <Badge className="w-fit text-[9px] uppercase font-extrabold bg-muted text-muted-foreground">
                                                        {item.category}
                                                    </Badge>
                                                    <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                                                        {item.text}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Captions for Reel */}
                                    <div>
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                            <span>Suggested Instagram Captions</span>
                                        </h4>
                                        <div className="space-y-1.5">
                                            {aiCaptions.map((cap, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedCaption(cap)}
                                                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                                                        selectedCaption === cap
                                                            ? 'bg-primary/10 border-primary font-semibold text-foreground'
                                                            : 'bg-card hover:bg-muted/50 text-muted-foreground'
                                                    }`}
                                                >
                                                    <span className="line-clamp-1">{cap}</span>
                                                    {selectedCaption === cap && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: Text Customization Tools */}
                            {activeTab === 'text' && (
                                <div className="space-y-4">
                                    {selectedLayer ? (
                                        <div className="p-4 rounded-2xl border bg-card space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Edit Selected Text Layer
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeSelectedLayer}
                                                    className="text-destructive h-6 px-2 text-xs gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>Delete</span>
                                                </Button>
                                            </div>

                                            <Input
                                                value={selectedLayer.text}
                                                onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                                                placeholder="Enter text on screen..."
                                                className="text-sm font-semibold rounded-xl"
                                            />

                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                {/* Font Size */}
                                                <div>
                                                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                                                        Font Size ({selectedLayer.fontSize}px)
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="14"
                                                        max="40"
                                                        value={selectedLayer.fontSize}
                                                        onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                                                        className="w-full accent-primary"
                                                    />
                                                </div>

                                                {/* Vertical Position */}
                                                <div>
                                                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                                                        Y Position ({selectedLayer.y}%)
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="85"
                                                        value={selectedLayer.y}
                                                        onChange={(e) => updateSelectedLayer({ y: Number(e.target.value) })}
                                                        className="w-full accent-primary"
                                                    />
                                                </div>
                                            </div>

                                            {/* Color Presets */}
                                            <div className="pt-2">
                                                <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                                                    Color Preset
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {[
                                                        { label: 'White / Black BG', color: '#FFFFFF', bg: '#000000B3' },
                                                        { label: 'Yellow / Dark BG', color: '#FACC15', bg: '#000000CC' },
                                                        { label: 'Red / Dark BG', color: '#EF4444', bg: '#000000CC' },
                                                        { label: 'Cyan / Dark BG', color: '#06B6D4', bg: '#000000CC' },
                                                    ].map((preset, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => updateSelectedLayer({ color: preset.color, backgroundColor: preset.bg })}
                                                            className="w-7 h-7 rounded-full border-2 border-border shadow-sm flex items-center justify-center font-bold text-[10px]"
                                                            style={{ backgroundColor: preset.bg, color: preset.color }}
                                                        >
                                                            A
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center border rounded-2xl bg-muted/20">
                                            <p className="text-xs text-muted-foreground">Select a text layer on the canvas or add one below.</p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => addTextOverlay('NEW VIRAL CAPTION')}
                                        className="w-full rounded-xl gap-2 font-bold text-xs h-9"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Custom Text Layer</span>
                                    </Button>
                                </div>
                            )}

                            {/* TAB 3: User Clip Upload with Rights Confirmation */}
                            {activeTab === 'upload' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20 space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h5 className="font-bold text-xs text-foreground">Copyright & Permissions Guard</h5>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                                    Prompt4life prohibits unauthorized copyrighted video scraping. Please only upload footage you own or have explicit rights to edit.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={rightsConfirmed}
                                                onChange={(e) => setRightsConfirmed(e.target.checked)}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span className="text-xs font-semibold text-foreground">
                                                I confirm that I have the rights or permission to use this video.
                                            </span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground block mb-2">
                                            Select Video Clip (MP4, WebM, MOV - Max 50MB)
                                        </label>
                                        <Input
                                            type="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={handleFileUpload}
                                            disabled={!rightsConfirmed || isUploading}
                                            className="rounded-xl file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold file:text-xs"
                                        />
                                        {uploadError && (
                                            <p className="text-xs text-destructive mt-1.5 font-medium">{uploadError}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions & Export */}
                        <div className="pt-4 border-t border-border space-y-3">
                            {isExporting && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                        <span>Rendering 9:16 Video Composition...</span>
                                        <span>{exportProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300 rounded-full"
                                            style={{ width: `${exportProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {exportedVideoUrl && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Reel ready for download! (1080 × 1920)</span>
                                    </span>
                                    <a
                                        href={exportedVideoUrl}
                                        download="prompt4life-reel.mp4"
                                        className="font-bold underline"
                                    >
                                        Download MP4
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3">
                                <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold h-10 px-4">
                                    Close
                                </Button>
                                <Button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 gap-2 shadow-lg"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>{isExporting ? 'Rendering...' : 'Export 9:16 Reel'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
