import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text || text.trim() === '') {
            return new NextResponse(JSON.stringify({ error: "Please share how you are feeling." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a mystical, highly aesthetic 'AI Vibe Checker' and digital fortune teller. 
        A user has shared their current mood or thoughts: "${text}".
        
        Your job is to read their energy and provide a poetic, slightly ethereal 'vibe check' along with a gorgeous Midjourney prompt that visualizes their current state.
        
        Respond ONLY with a valid JSON object matching exactly this schema:
        {
            "vibe_reading": "string", // A 2-3 sentence poetic, mystical reading of their mood
            "aura_colors": "string", // 2-3 colors that represent their energy (e.g. 'Iridescent blue and soft lavender')
            "aesthetic_prompt": "string" // A highly detailed, 50-word Midjourney image prompt visualizing their vibe
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
        console.error("Vibe Check Error:", error);
        return new NextResponse(JSON.stringify({ error: "The crystal ball is cloudy. Failed to read vibe." }), { status: 500 });
    }
}
