import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { prompt: userPrompt, targetModel } = await req.json();

        if (!userPrompt || !userPrompt.trim()) {
            return new NextResponse(JSON.stringify({ error: "Please provide a prompt to diagnose." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are the World's Premier AI Prompt Diagnostic Engineer and Prompt Doctor.
Analyze, diagnose, and benchmark the following user prompt for performance across leading AI models, prioritizing ChatGPT (GPT-4o / DALL-E 3) and Google Gemini (Imagen 3 / 1.5 Pro).

USER PROMPT TO DIAGNOSE:
"""
${userPrompt.trim()}
"""

TARGET ENGINE FOCUS: ${targetModel || 'ChatGPT & Gemini'}

Evaluate the prompt across these strict criteria:
1. Clarity & Specificity (Is the subject, intent, format, and structure clear or ambiguous?)
2. Token Efficiency / Fluff (Does it contain generic filler words like "photorealistic", "ultra hd", "best quality", "very good" that waste token budget without adding value?)
3. Contextual & Stylistic Depth (Does it specify lighting, composition, tone, camera, role, constraints, or step-by-step instructions?)
4. Robustness & Anti-Patterns (Are there contradictions, vague modifiers, negative hallucinations, or missing constraints?)

Respond ONLY with a valid JSON object matching exactly this schema:
{
    "overall_score": 78, // Number from 1 to 100
    "grade": "B+", // Letter grade: A+, A, B+, B, C+, C, D, F
    "verdict": "Short 3-6 word summary verdict (e.g. 'Strong Concept but Diluted by Token Fluff')",
    "sub_scores": {
        "clarity": 85, // 1-100
        "efficiency": 60, // 1-100 (penalize filler words)
        "depth": 75, // 1-100
        "robustness": 80 // 1-100
    },
    "token_analysis": {
        "power_tokens": ["string", "string", "string"], // 3-6 high-impact steering words from the user's prompt
        "fluff_tokens": ["string", "string"], // 1-5 filler or weak words to remove/replace (e.g. "photorealistic", "super detailed", "4k")
        "contradictions": ["string"] // Any contradictory or conflicting instructions found, or empty array if none
    },
    "diagnosis": [
        "Specific diagnostic finding 1 highlighting a critical flaw or missed opportunity",
        "Specific diagnostic finding 2",
        "Specific diagnostic finding 3"
    ],
    "prescriptions": {
        "chatgpt_optimized": "A masterfully re-engineered, god-tier version of this prompt written specifically for ChatGPT (GPT-4o / DALL-E 3) with exact framing and structure.",
        "gemini_optimized": "A masterfully re-engineered version written specifically for Google Gemini (Imagen 3 / Gemini 1.5) with rich semantic cues and camera/lighting fidelity.",
        "midjourney_optimized": "A masterfully re-engineered version formatted for Midjourney v6.1 with clean comma-separated keywords and --ar / --v 6.1 tags."
    },
    "pro_tip": "One concise, high-value prompt engineering takeaway rule applicable to this prompt."
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let jsonStr = responseText;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsedJson = JSON.parse(jsonStr);

        return NextResponse.json({ result: parsedJson });

    } catch (error: any) {
        console.error("Prompt Doctor API Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to diagnose prompt." }), { status: 500 });
    }
}
