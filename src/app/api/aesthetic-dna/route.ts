import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const MARKETPLACE_CATEGORIES = [
    'Models',
    'Art & Illustrations',
    'Logos & Icons',
    'Graphics & Design',
    'Productivity & Writing',
    'Marketing & Business',
    'Photography',
    'Games & 3D'
];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return new NextResponse(JSON.stringify({ error: "No image provided." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new NextResponse(JSON.stringify({ error: "API key not configured." }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const bytes = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(bytes).toString('base64');

        const prompt = `Analyze this image and extract its 'Aesthetic DNA' for a prompt marketplace search engine.
        
        Identify which of these marketplace categories it fits best: ${MARKETPLACE_CATEGORIES.join(', ')}.
        
        Also extract 5-8 descriptive style keywords that represent its visual vibe (e.g., lighting, texture, artistic medium, mood).
        
        Respond ONLY with a valid JSON object matching this schema:
        {
            "primary_category": "string",
            "aesthetic_tags": ["string", "string", ...],
            "vibe_summary": "string" // A poetic 1-sentence description of the visual mood
        }`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: imageFile.type
                }
            },
            prompt
        ]);

        const responseText = result.response.text();
        
        // Clean JSON response
        let jsonStr = responseText;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsedJson = JSON.parse(jsonStr);

        return NextResponse.json({ result: parsedJson });

    } catch (error: any) {
        console.error("Aesthetic DNA Error:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to extract Visual DNA." }), { status: 500 });
    }
}
