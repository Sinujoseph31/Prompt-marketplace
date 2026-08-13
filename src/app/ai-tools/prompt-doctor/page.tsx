'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Activity,
    Sparkles,
    Copy,
    Check,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Flame,
    AlertTriangle,
    ShieldAlert,
    Lightbulb,
    RefreshCw,
    Stethoscope,
    Wand2,
    Zap,
    Target,
    Terminal
} from 'lucide-react'

const SAMPLE_PROMPTS = [
    {
        label: "Fluffy Portrait",
        prompt: "A beautiful, hyperrealistic, ultra detailed 8k photorealistic portrait of a young woman in nature, trending on artstation, masterpiece, best quality."
    },
    {
        label: "Vague Coding Task",
        prompt: "Write me a React app for a todo list with some nice styling and make it work fast."
    },
    {
        label: "Contradictory Fantasy Scene",
        prompt: "A minimalist, hyper-cluttered fantasy wizard room at dark midnight lit by blinding bright afternoon sunlight."
    },
    {
        label: "Marketing Copy Draft",
        prompt: "Write a high converting landing page headline for my SaaS software that is very good and makes users buy now."
    }
]

type SubScores = {
    clarity: number;
    efficiency: number;
    depth: number;
    robustness: number;
}

type TokenAnalysis = {
    power_tokens: string[];
    fluff_tokens: string[];
    contradictions: string[];
}

type Prescriptions = {
    chatgpt_optimized: string;
    gemini_optimized: string;
    midjourney_optimized: string;
}

type DiagnosisResult = {
    overall_score: number;
    grade: string;
    verdict: string;
    sub_scores: SubScores;
    token_analysis: TokenAnalysis;
    diagnosis: string[];
    prescriptions: Prescriptions;
    pro_tip: string;
}

export default function PromptDoctorPage() {
    const [promptText, setPromptText] = useState('')
    const [targetModel, setTargetModel] = useState<'chatgpt' | 'gemini' | 'universal'>('chatgpt')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<DiagnosisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [activePrescriptionTab, setActivePrescriptionTab] = useState<'chatgpt' | 'gemini' | 'midjourney'>('chatgpt')

    const handleDiagnose = async () => {
        if (!promptText.trim()) {
            setError("Please enter a prompt to diagnose.")
            return
        }

        setIsAnalyzing(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/prompt-doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText.trim(),
                    targetModel: targetModel === 'chatgpt' ? 'ChatGPT (GPT-4o)' : targetModel === 'gemini' ? 'Google Gemini (Imagen 3 / 1.5 Pro)' : 'Universal'
                })
            })

            if (!res.ok) {
                const errorText = await res.text()
                let errorMsg = 'Failed to analyze prompt.'
                try {
                    const parsed = JSON.parse(errorText)
                    errorMsg = parsed.error || errorMsg
                } catch {
                    errorMsg = errorText
                }
                throw new Error(errorMsg)
            }

            const data = await res.json()
            setResult(data.result)
            setActivePrescriptionTab(targetModel === 'gemini' ? 'gemini' : 'chatgpt')

            setTimeout(() => {
                document.getElementById('doctor-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during prompt diagnosis.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const copyToClipboard = (text: string, key: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        if (score >= 70) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
        if (score >= 50) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
        return 'text-red-400 border-red-500/30 bg-red-500/10'
    }

    const getScoreGradient = (score: number) => {
        if (score >= 85) return 'from-emerald-500 to-teal-400'
        if (score >= 70) return 'from-cyan-500 to-blue-400'
        if (score >= 50) return 'from-yellow-500 to-amber-400'
        return 'from-red-500 to-orange-500'
    }

    const getActivePrescriptionText = () => {
        if (!result) return ''
        if (activePrescriptionTab === 'chatgpt') return result.prescriptions.chatgpt_optimized
        if (activePrescriptionTab === 'gemini') return result.prescriptions.gemini_optimized
        return result.prescriptions.midjourney_optimized
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-slate-200 relative selection:bg-emerald-500/30 pb-24 font-sans">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/15 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-6xl px-4 sm:px-6 pt-12 md:pt-16 flex flex-col gap-10 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-4 text-center items-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] tracking-widest text-xs font-mono rounded-md backdrop-blur-md uppercase">
                        <Activity className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
                        AI Benchmark & Diagnostics Suite
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase text-center">
                        Prompt Doctor
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl px-4 leading-relaxed font-mono">
                        Diagnose weak tokens, eliminate fluff, and optimize your prompts for <span className="text-emerald-400 font-semibold">ChatGPT</span> & <span className="text-cyan-400 font-semibold">Gemini</span>.
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Input & Controls (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col gap-5">

                            {/* Header label & Clear button */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Stethoscope className="w-4 h-4" />
                                    Input Prompt for Diagnosis
                                </span>
                                {promptText && (
                                    <button
                                        type="button"
                                        onClick={() => { setPromptText(''); setResult(null); setError(null); }}
                                        className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>

                            {/* Prompt Input Box */}
                            <Textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                placeholder="Paste your image, coding, creative, or reasoning prompt here to benchmark and diagnose..."
                                rows={6}
                                className="bg-zinc-950 border-zinc-800 text-sm font-mono placeholder:text-zinc-600 resize-none rounded-xl focus-visible:ring-cyan-500/50 leading-relaxed"
                            />

                            {/* Target Model Selector */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                                    Target Engine Calibration:
                                </span>
                                <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setTargetModel('chatgpt')}
                                        className={`py-2 px-2 rounded-lg font-mono text-xs font-bold transition-all ${
                                            targetModel === 'chatgpt'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        ChatGPT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetModel('gemini')}
                                        className={`py-2 px-2 rounded-lg font-mono text-xs font-bold transition-all ${
                                            targetModel === 'gemini'
                                                ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        Gemini
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetModel('universal')}
                                        className={`py-2 px-2 rounded-lg font-mono text-xs font-bold transition-all ${
                                            targetModel === 'universal'
                                                ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                        }`}
                                    >
                                        Universal
                                    </button>
                                </div>
                            </div>

                            {/* Sample Prompts */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                    <Wand2 className="w-3 h-3 text-cyan-400" /> Try Sample Problem Prompts:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {SAMPLE_PROMPTS.map((sample, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setPromptText(sample.prompt)}
                                            className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
                                        >
                                            {sample.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-950/30 text-red-400 text-xs rounded-xl border border-red-900/50 flex items-center gap-2.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Diagnose Button */}
                            <Button
                                onClick={handleDiagnose}
                                disabled={isAnalyzing || !promptText.trim()}
                                className="h-12 font-bold font-mono uppercase tracking-wider rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all mt-1"
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Running Forensic Scan...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Diagnose & Fix Prompt
                                    </span>
                                )}
                            </Button>

                        </div>
                    </div>

                    {/* Right Column: Diagnostic & Prescription Dashboard (7 cols) */}
                    <div id="doctor-results" className="lg:col-span-7 flex flex-col gap-6 min-h-[500px]">
                        {!result && !isAnalyzing ? (
                            <div className="w-full h-full min-h-[450px] rounded-2xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center p-10 text-center text-zinc-600">
                                <Stethoscope className="w-16 h-16 mb-4 opacity-40 text-cyan-500 animate-pulse" />
                                <h3 className="text-xl font-bold mb-2 font-mono uppercase text-zinc-400">Diagnostic Scanner Standby</h3>
                                <p className="text-sm leading-relaxed max-w-sm text-zinc-500">
                                    Enter or paste your prompt on the left. The Doctor will analyze token density, detect contradictory instructions, and prescribe 1-click optimized revisions.
                                </p>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="w-full h-full min-h-[450px] rounded-2xl border border-cyan-500/30 bg-zinc-900/40 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-px bg-cyan-400 shadow-[0_0_15px_#06B6D4] animate-scan"></div>
                                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                                <h3 className="text-lg font-bold font-mono uppercase text-cyan-400 tracking-wider">
                                    Analyzing Token Weights & Fluff Ratios
                                </h3>
                                <p className="text-xs text-zinc-400 font-mono mt-2 max-w-xs">
                                    Evaluating semantic clarity, prompt injection risks, and generating optimized ChatGPT & Gemini prescriptions...
                                </p>
                            </div>
                        ) : result ? (
                            <div className="w-full flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 fade-in">

                                {/* Top Score Card */}
                                <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col gap-6 relative overflow-hidden">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Score Badge Circular Gauge */}
                                            <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center font-mono ${getScoreColor(result.overall_score)}`}>
                                                <span className="text-3xl font-black leading-none">{result.overall_score}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Grade {result.grade}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Diagnostic Verdict</span>
                                                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                                                    {result.verdict}
                                                </h3>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className={`px-3 py-1 text-xs font-mono uppercase ${getScoreColor(result.overall_score)}`}>
                                            {result.overall_score >= 85 ? 'God-Tier' : result.overall_score >= 70 ? 'Competent' : result.overall_score >= 50 ? 'Needs Work' : 'Critical Flaws'}
                                        </Badge>
                                    </div>

                                    {/* 4 Sub-score Progress Bars */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                                        <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-zinc-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-cyan-400" /> Clarity & Precision</span>
                                                <span className="font-bold text-white">{result.sub_scores.clarity}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-gradient-to-r ${getScoreGradient(result.sub_scores.clarity)} rounded-full`} style={{ width: `${result.sub_scores.clarity}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-zinc-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Token Efficiency</span>
                                                <span className="font-bold text-white">{result.sub_scores.efficiency}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-gradient-to-r ${getScoreGradient(result.sub_scores.efficiency)} rounded-full`} style={{ width: `${result.sub_scores.efficiency}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-zinc-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-blue-400" /> Context & Depth</span>
                                                <span className="font-bold text-white">{result.sub_scores.depth}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-gradient-to-r ${getScoreGradient(result.sub_scores.depth)} rounded-full`} style={{ width: `${result.sub_scores.depth}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-zinc-400 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Robustness</span>
                                                <span className="font-bold text-white">{result.sub_scores.robustness}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-gradient-to-r ${getScoreGradient(result.sub_scores.robustness)} rounded-full`} style={{ width: `${result.sub_scores.robustness}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Token Heatmap Analysis */}
                                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4">
                                    <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Token Weight Heatmap
                                    </span>

                                    <div className="flex flex-col gap-3">
                                        {/* Power Tokens */}
                                        {result.token_analysis.power_tokens && result.token_analysis.power_tokens.length > 0 && (
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                                                    <Flame className="w-3.5 h-3.5 text-emerald-400" /> High-Impact Power Tokens:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.token_analysis.power_tokens.map((token, i) => (
                                                        <Badge key={i} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-mono py-1 px-2.5">
                                                            + {token}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fluff Tokens */}
                                        {result.token_analysis.fluff_tokens && result.token_analysis.fluff_tokens.length > 0 && (
                                            <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/60">
                                                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Weak / Fluff Tokens (Dilutes Output):
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.token_analysis.fluff_tokens.map((token, i) => (
                                                        <Badge key={i} variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono py-1 px-2.5 line-through opacity-80">
                                                            {token}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contradictions */}
                                        {result.token_analysis.contradictions && result.token_analysis.contradictions.length > 0 && (
                                            <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/60">
                                                <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Conflicting Instructions Detected:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.token_analysis.contradictions.map((token, i) => (
                                                        <Badge key={i} className="bg-red-500/10 text-red-300 border-red-500/40 text-xs font-mono py-1 px-2.5">
                                                            ⚠️ {token}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Clinical Diagnosis Findings */}
                                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                                    <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" />
                                        Doctor's Clinical Findings
                                    </span>
                                    <div className="flex flex-col gap-2">
                                        {result.diagnosis.map((finding, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                                                <span className="w-4 h-4 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
                                                    {idx + 1}
                                                </span>
                                                <span>{finding}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 1-Click Optimized Prescriptions */}
                                <div className="p-6 rounded-2xl bg-zinc-900/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.08)] flex flex-col gap-5">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                            <Wand2 className="w-4 h-4 text-cyan-400" />
                                            Doctor's Prescription (Optimized Prompt)
                                        </span>
                                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            100% Fluff Free
                                        </span>
                                    </div>

                                    {/* Tabs Switcher for ChatGPT / Gemini / Midjourney */}
                                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setActivePrescriptionTab('chatgpt')}
                                            className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                activePrescriptionTab === 'chatgpt'
                                                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            ChatGPT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePrescriptionTab('gemini')}
                                            className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                activePrescriptionTab === 'gemini'
                                                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Gemini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePrescriptionTab('midjourney')}
                                            className={`py-2 px-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                activePrescriptionTab === 'midjourney'
                                                    ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                            }`}
                                        >
                                            Midjourney
                                        </button>
                                    </div>

                                    {/* Prescription Prompt Display Box */}
                                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-serif text-sm sm:text-base leading-relaxed selection:bg-cyan-500/30">
                                        {getActivePrescriptionText()}
                                    </div>

                                    {/* 1-Click Copy Button */}
                                    <Button
                                        onClick={() => copyToClipboard(getActivePrescriptionText(), 'prescription')}
                                        className={`w-full h-12 font-bold font-mono uppercase tracking-wider rounded-xl transition-all ${
                                            copiedKey === 'prescription'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                                : activePrescriptionTab === 'chatgpt'
                                                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md'
                                                : activePrescriptionTab === 'gemini'
                                                ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md'
                                                : 'bg-purple-500 hover:bg-purple-400 text-zinc-950 shadow-md'
                                        }`}
                                    >
                                        {copiedKey === 'prescription' ? (
                                            <><Check className="w-4 h-4 mr-2" /> Copied {activePrescriptionTab.toUpperCase()} Prescription</>
                                        ) : (
                                            <><Copy className="w-4 h-4 mr-2" /> Copy {activePrescriptionTab === 'chatgpt' ? 'ChatGPT' : activePrescriptionTab === 'gemini' ? 'Gemini' : 'Midjourney'} Version</>
                                        )}
                                    </Button>
                                </div>

                                {/* Pro Engineering Tip Card */}
                                {result.pro_tip && (
                                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                                        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                                                Pro Engineering Rule:
                                            </span>
                                            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                                                {result.pro_tip}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : null}
                    </div>

                </div>

            </div>
        </div>
    )
}
