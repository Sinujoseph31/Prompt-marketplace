import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

// Hardcoded arrays of chaotic concepts
const SUBJECTS = [
    "a grandmother knitting a laser sweater",
    "a cybernetic sloth wearing aviator sunglasses",
    "a renaissance-era DJ spinning vinyl",
    "a giant bioluminescent tardigrade",
    "a mafia boss who is actually a golden retriever",
    "an astronaut trying to eat a sloppy joe in zero gravity"
];

const ACTIONS = [
    "aggressively breakdancing",
    "negotiating a peace treaty with interdimensional beings",
    "trying to parallel park a spaceship",
    "hacking the mainframe with an acoustic guitar",
    "summoning a neon demon using only latte art",
    "running a covert underground bakery"
];

const STYLES = [
    "80s dark synthwave",
    "hyper-realistic 3D render, octane engine",
    "ethereal watercolor painting by Studio Ghibli",
    "grimy cyberpunk polaroid photograph",
    "minimalist corporate memphis corporate art",
    "19th-century oil painting with severe dramatic lighting (chiaroscuro)"
];

export async function POST() {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Generate the random seed
        const randomSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];

        const seed = `${randomSubject} who is ${randomAction} in the style of ${randomStyle}.`;

        const prompt = `You are the Chaos Generator, an AI designed to write the most unhinged, visually spectacular, and wildly detailed image generation prompts imaginable.
        
        Take this chaotic seed idea: "${seed}"
        
        Your job is to expand this simple seed into a massive, highly descriptive, professional-grade prompt (50-100 words) ready for Midjourney or DALL-E. Make it bizarre, vivid, and hilarious.
        
        Respond ONLY with a valid JSON object matching exactly this schema:
        {
            "chaos_level": "string", // A funny custom label like 'Level 9: Absolute Bedlam'
            "prompt": "string", // The massive, highly detailed prompt
            "tags": ["string"] // 3-4 short, punchy comma-separated tags describing the vibe
        }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from potential markdown formatting
        let jsonStr = responseText;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsedJson = JSON.parse(jsonStr);

        return NextResponse.json({ result: parsedJson });

    } catch (error: any) {
        console.error("Chaos Generator Error:", error);
        return new NextResponse(JSON.stringify({ error: "The chaos was too strong. Failed to generate." }), { status: 500 });
    }
}
