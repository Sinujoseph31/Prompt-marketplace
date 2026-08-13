import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const DEFAULT_SCENES = [
    { id: 'studio', title: 'Studio Headshot', prompt_cue: 'Professional 85mm portrait in a photography studio with clean softbox lighting and neutral seamless backdrop.' },
    { id: 'coffee', title: 'Cozy Coffee Shop', prompt_cue: 'Sitting in a warm, artisanal coffee shop holding a ceramic mug with soft natural window light and subtle background blur.' },
    { id: 'cyberpunk', title: 'Cyberpunk Neon City', prompt_cue: 'Walking through a futuristic rainy neon-lit street at night with vibrant reflections and volumetric mist.' },
    { id: 'outdoor', title: 'Golden Hour Sunlight', prompt_cue: 'Standing in a sun-drenched outdoor park or scenic landscape during sunset with warm golden rim light and lens flare.' },
    { id: 'fitness', title: 'Fitness & Gym Workout', prompt_cue: 'In a modern gym wearing sleek athletic sportswear, dramatic moody workout lighting with subtle sweat sheen and fitness equipment.' },
    { id: 'office', title: 'Tech Startup Office', prompt_cue: 'In a bright glass-walled modern tech office holding a laptop, stylish corporate-casual attire, natural diffuse office lighting.' },
    { id: 'polaroid', title: 'Vintage 90s Polaroid', prompt_cue: 'Direct flash vintage 1990s 35mm Polaroid film photograph with authentic film grain, slight vignetting, and candid nostalgic vibe.' },
    { id: 'space', title: 'Sci-Fi Space Explorer', prompt_cue: 'Wearing an ultra-detailed futuristic astronaut suit inside a spaceship observation deck with panoramic view of glowing stars and nebula.' },
    { id: 'fantasy', title: 'Medieval Fantasy Knight', prompt_cue: 'Wearing detailed medieval armor or fantasy tunic standing before an ancient misty stone castle at dawn with dramatic atmosphere.' },
    { id: 'travel', title: 'Luxury Travel & Airport', prompt_cue: 'Sitting in an elite first-class airline lounge or private jet window seat with luxury travel luggage and cinematic depth of field.' },
    { id: 'podcast', title: 'Podcast / Creator Studio', prompt_cue: 'In front of a Shure SM7B studio microphone with acoustic foam backdrop, warm headphone wear, and aesthetic RGB ambient backlighting.' },
    { id: 'winter', title: 'Winter Snow Resort', prompt_cue: 'Standing in a snowy alpine ski resort wearing a stylish winter puffer coat, soft snowflakes gently falling on hair, snowy pines in background.' },
    { id: 'editorial', title: 'High-Fashion Editorial', prompt_cue: 'High-fashion magazine cover shoot with dramatic chiaroscuro lighting and elegant avant-garde couture wardrobe.' },
    { id: 'anime', title: 'Studio Ghibli / 2D Anime', prompt_cue: 'Hand-drawn 2D anime frame in lush Studio Ghibli style with painted watercolor background while preserving the exact facial proportions and eye shape.' },
    { id: 'action', title: 'Cinematic 3D Hero', prompt_cue: 'Cinematic high-octane movie still with tactical outfit, dramatic rim light, dust particles, and cinematic color grading.' }
];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const characterDescription = formData.get('character_description') as string || '';
        const scenesJson = formData.get('scenes') as string || '';
        const customScene = formData.get('custom_scene') as string || '';

        if (!file && !characterDescription.trim()) {
            return new NextResponse(JSON.stringify({ error: "Please provide either an image or a character description." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        let requestedScenes: { id: string; title: string; prompt_cue: string }[] = [];
        try {
            if (scenesJson) {
                const parsedIds = JSON.parse(scenesJson);
                if (Array.isArray(parsedIds) && parsedIds.length > 0) {
                    requestedScenes = DEFAULT_SCENES.filter(s => parsedIds.includes(s.id));
                }
            }
        } catch {
            requestedScenes = DEFAULT_SCENES.slice(0, 4);
        }

        if (requestedScenes.length === 0) {
            requestedScenes = DEFAULT_SCENES.slice(0, 4);
        }

        if (customScene.trim()) {
            requestedScenes.push({
                id: 'custom',
                title: 'Custom Scene',
                prompt_cue: customScene.trim()
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const scenesDescription = requestedScenes.map(s => `- ID: "${s.id}", Title: "${s.title}", Scene Context: "${s.prompt_cue}"`).join('\n');

        const prompt = `You are a world-class AI Character Architect and Prompt Engineer specializing in biometric facial consistency across diverse scenes for ChatGPT (GPT-4o / DALL-E 3) and Google Gemini (Imagen 3).

Your Mission:
1. Extract or synthesize a comprehensive, ultra-precise Biometric Identity DNA for this character (eye shape/iris color, nose bridge, jawline, lips, skin tone/texture/pores, hair texture/color/parting/length, age, and natural expression).
2. For EVERY requested scene listed below, construct highly detailed, identity-locked prompts tailored specifically for:
   - "chatgpt_prompt": Natural language narrative format with strict facial consistency instructions for ChatGPT (GPT-4o / DALL-E 3).
   - "gemini_prompt": Photorealistic prompt with lighting, camera lens, and facial landmark retention for Google Gemini (Imagen 3).
   - "midjourney_prompt": Midjourney v6.1 format with styling parameters and "--cref [IMAGE_URL] --cw 100".

Requested Scenes to generate:
${scenesDescription}

User Context / Description:
${characterDescription || "Analyze the provided reference image directly."}

Respond ONLY with a valid JSON object matching this schema:
{
    "character_dna": {
        "title": "Short descriptive character title (e.g. 'Elena - Emerald Eyed Architect')",
        "estimated_age": "e.g. 26 years old",
        "gender": "e.g. Female",
        "key_facial_signatures": [
            "Specific facial trait 1 (e.g. Deep almond-shaped hazel-green eyes with subtle arch brows)",
            "Specific facial trait 2 (e.g. High sculpted cheekbones with light bridge freckles)",
            "Specific facial trait 3 (e.g. Chestnut wavy shoulder-length hair with warm golden undertones)",
            "Specific facial trait 4 (e.g. Defined soft jawline with subtle natural resting smile)"
        ],
        "body_physique_signatures": [
            "Specific body trait 1 (e.g. Athletic lean build with graceful neck and defined collarbones)",
            "Specific body trait 2 (e.g. Warm olive skin tone with healthy natural glow)",
            "Specific body trait 3 (e.g. Confident upright posture with relaxed shoulders)"
        ],
        "sub_metrics": {
            "image_clarity": 94, // 1-100 score of source resolution/clarity
            "face_match": 96, // 1-100 score of facial landmark retention
            "body_proportions": 90, // 1-100 score of body & silhouette consistency
            "lighting_fidelity": 92 // 1-100 score of lighting accuracy
        },
        "full_identity_anchor": "A 40-word standalone biometric description paragraph used to anchor the character's face, body, and style across all AI models."
    },
    "scenes": [
        {
            "id": "string (matching scene ID)",
            "title": "string (scene title)",
            "chatgpt_prompt": "Ultra-detailed natural language prompt for ChatGPT/GPT-4o keeping the exact face described in full_identity_anchor in this scene.",
            "gemini_prompt": "Ultra-detailed prompt for Google Gemini (Imagen 3) with precise camera, lighting, and facial preservation.",
            "midjourney_prompt": "Midjourney v6 prompt with --ar 16:9 --v 6.1 --cref [IMAGE_URL] --cw 100"
        }
    ],
    "consistency_guide": {
        "chatgpt": "Specific instructions on uploading the reference photo alongside this prompt in ChatGPT.",
        "gemini": "Specific instructions on keeping face likeness with Gemini / Imagen 3."
    }
}`;

        let contents: any[] = [prompt];

        if (file) {
            const buffer = await file.arrayBuffer();
            const base64String = Buffer.from(buffer).toString('base64');
            const mimeType = file.type || 'image/jpeg';
            contents.push({
                inlineData: {
                    data: base64String,
                    mimeType
                }
            });
        }

        const result = await model.generateContent(contents);
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
        console.error("Character Studio API Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate consistent character scenes." }), { status: 500 });
    }
}
