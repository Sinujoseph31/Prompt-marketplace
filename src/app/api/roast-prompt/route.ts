import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new NextResponse(JSON.stringify({ error: "Please provide a prompt to roast." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a hilariously savage AI prompt engineer and art critic. A user has submitted an image generation prompt. 
        
        Your job is to:
        1. Give it a 'roast_score' from 1 to 10 (10 being the worst, most generic prompt ever).
        2. Write a 'savage_roast' (1-2 sentences) making fun of how basic, confusing, or boring their prompt is. Be witty, slightly mean, but clearly in a joking tone.
        3. Write a 'god_tier_prompt' which is your massively improved, professional-grade version of what they were trying to create. It should be highly detailed, use great keywords, and be ready to paste into Midjourney or DALL-E.

        The user's prompt is: "${text}"

        Respond ONLY with a valid JSON object matching exactly this schema:
        {
            "roast_score": number,
            "savage_roast": "string",
            "god_tier_prompt": "string"
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
        console.error("Roast Prompt Generation Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate roast." }), { status: 500 });
    }
}
