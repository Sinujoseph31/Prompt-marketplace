import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Increase max duration for Vercel/NextJS serverless functions as image processing can take slightly longer
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return new NextResponse(JSON.stringify({ error: "No image file provided." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using flash for speed, it handles images well
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert AI Prompt Engineer and Digital Art Analyst. 
        Your task is to Forensically 'Reverse Engineer' the provided image and generate the exact prompt that was likely used to create it.
        
        Analyze the image for:
        1. Primary subjects and their actions
        2. Artistic style (e.g., Cyberpunk, Hyperrealistic, Watercolor, 3D Render)
        3. Lighting and atmosphere (e.g., volumetric lighting, cinematic, gloomy)
        4. Camera angles or perspectives (e.g., extreme close up, drone shot, isometric)
        5. Suspected rendering engine or medium (e.g., Unreal Engine 5, Octane Render, Oil on Canvas)

        Respond ONLY with a valid JSON object matching exactly this schema:
        {
            "reconstructed_prompt": "string", // A dense, highly detailed 50-100 word prompt
            "detected_style": "string", // The primary overriding art style (1-3 words)
            "confidence_score": number, // Your confidence in this reconstruction from 1 to 100
            "key_elements": ["string", "string"] // An array of 4-6 specific visual tags/keywords found
        }`;

        const imagePart = {
            inlineData: {
                data: base64String,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
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
        console.error("Reverse Engineer API Error:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to reverse engineer the image. The AI is stumped." }), { status: 500 });
    }
}
