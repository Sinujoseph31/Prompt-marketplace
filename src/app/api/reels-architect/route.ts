import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { topic, niche = 'Tech & AI', style = 'Fast-Paced Hook (Alex Hormozi style)', duration = '15s' } = await req.json();

        if (!topic || !topic.trim()) {
            return new NextResponse(JSON.stringify({ error: "Please provide a topic or idea for the Reel." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a World-Class Viral Short-Form Video Producer, Growth Hacker, and AI Video Director specializing in Instagram Reels, TikToks, and YouTube Shorts with millions of views.

Your task is to craft an ultra-engaging, high-retention Instagram Reel production blueprint for the following:

TOPIC / IDEA: "${topic.trim()}"
NICHE: "${niche}"
PACING / STYLE: "${style}"
TARGET DURATION: "${duration}"

Generate a masterclass storyboard with:
1. Three distinct, scroll-stopping 3-second hook variations (Curiosity Gap, Shock/Controversial, and High Relatability/Pain Point).
2. Audio & Soundtrack recommendations (BPM, mood, and search term for Instagram Reels audio library).
3. Exact Scene-by-Scene storyboard with:
   - Precise timestamps
   - Punchy voiceover script
   - Dynamic on-screen text overlays (formatted with ALL-CAPS keywords)
   - Real-world action / camera direction
   - Ready-to-use AI Video / Image Generation Prompt (engineered for Midjourney v6 / Runway Gen-3 / Luma Dream Machine / Flux with --ar 9:16 aspect ratio).
4. Conversion-optimized Instagram caption with hook, value, and ManyChat comment-to-DM trigger keyword.
5. High-reach hashtags.

Respond ONLY with a valid JSON object matching exactly this schema:
{
    "title": "Short Catchy Reel Title",
    "hook_score": 98, // Number from 80 to 99
    "predicted_retention": "89% avg watch-through",
    "hooks": [
        {
            "type": "Curiosity Gap",
            "voiceover": "What to say in the first 2 seconds...",
            "on_screen_text": "TEXT IN ALL CAPS ON SCREEN",
            "visual_action": "Fast visual transition / zoom in description"
        },
        {
            "type": "Shock & Controversy",
            "voiceover": "Controversial or disruptive opener...",
            "on_screen_text": "BOLD TEXT ON SCREEN",
            "visual_action": "Shocking visual movement / glitch"
        },
        {
            "type": "Pain Point & Relatable",
            "voiceover": "Calling out a painful struggle or mistake...",
            "on_screen_text": "RELATABLE QUESTION ON SCREEN",
            "visual_action": "Reaction face / direct camera gaze"
        }
    ],
    "audio_vibe": {
        "genre": "Genre name (e.g. Phonk / Cyberpunk Synth / Cinematic Lo-Fi)",
        "bpm": "128 - 135 BPM (High Energy)",
        "search_query": "Exact song style to search on Instagram"
    },
    "scenes": [
        {
            "scene_number": 1,
            "timestamp": "00:00 - 00:03",
            "voiceover": "Voiceover audio text for scene 1",
            "on_screen_text": "Subtitles with HIGHLIGHTED words",
            "visual_action": "Camera movement / actor action / screen recording cue",
            "ai_video_prompt": "Hyper-detailed 40-70 word video prompt for Runway Gen-3 / Midjourney v6 with cinematic camera angle, lighting, 9:16 aspect ratio, 8k --ar 9:16"
        },
        {
            "scene_number": 2,
            "timestamp": "00:03 - 00:08",
            "voiceover": "Voiceover audio text for scene 2",
            "on_screen_text": "Subtitles with HIGHLIGHTED words",
            "visual_action": "Camera movement / transition cue",
            "ai_video_prompt": "Hyper-detailed video prompt --ar 9:16"
        },
        {
            "scene_number": 3,
            "timestamp": "00:08 - 00:15",
            "voiceover": "Voiceover audio text for scene 3 with call to action",
            "on_screen_text": "Call to action text",
            "visual_action": "Final reveal / pointing to link / phone tap",
            "ai_video_prompt": "Hyper-detailed video prompt --ar 9:16"
        }
    ],
    "manychat_keyword": "KEYWORD", // e.g. "PROMPT" or "SECRET" or "VAULT"
    "caption": "Complete Instagram caption with emojis, hook line, value bullets, and 'Comment KEYWORD to get the full link in your DMs' CTA.",
    "hashtags": ["#aiart", "#promptengineering", "#reelsgrowth", "#instagramtips", "#midjourney"]
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
        console.error("Reels Architect API Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate reel blueprint." }), { status: 500 });
    }
}
