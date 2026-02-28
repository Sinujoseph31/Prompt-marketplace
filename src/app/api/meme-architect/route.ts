import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();

        if (!topic || topic.trim() === '') {
            return new NextResponse(JSON.stringify({ error: "Please provide a topic for the meme." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a viral internet culture expert and 'Meme Architect'. A user has given you a topic: "${topic}".
        
        Your job is to design a hilariously relatable, highly shareable meme concept based on this topic.
        
        You must provide two things:
        1. The actual text that will be written on the meme (split into 'top_text' and 'bottom_text'). Make it punchy and funny.
        2. A highly detailed image generation prompt designed for Midjourney so the user can generate the exact background image needed for the meme.
        
        Respond ONLY with a valid JSON object matching exactly this schema:
        {
            "meme_format_idea": "string", // A 1-sentence description of the visual joke (e.g. 'A distressed man looking at a butterfly')
            "top_text": "string", // Text for the top of the meme IN ALL CAPS
            "bottom_text": "string", // Text for the bottom of the meme IN ALL CAPS
            "image_prompt_for_background": "string" // A 40-60 word literal prompt to generate the background image
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
        console.error("Meme Architect Error:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to architect meme. The internet broke." }), { status: 500 });
    }
}
