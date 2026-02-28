import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { imageBase64, mimeType } = await req.json();

        if (!imageBase64) {
            return new NextResponse(JSON.stringify({ error: "Provide an image." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new NextResponse(JSON.stringify({ error: "Server missing Gemini API key" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a highly creative AI prompt engineer. Deeply analyze this image and generate a single, highly creative, very detailed, 1-2 sentence text prompt concept that describes the image but adds a wildly imaginative, unexpected twist to it. This will be used as a seed idea for an AI image generator. Return ONLY the text, nothing else. No intro, no quotes.`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().trim();

        return NextResponse.json({ idea: text });

    } catch (error: any) {
        console.error("[SURPRISE_IMAGE_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed" }), { status: 500 });
    }
}
