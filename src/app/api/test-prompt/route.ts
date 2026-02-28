import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return new NextResponse(JSON.stringify({ error: "Missing prompt parameter" }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new NextResponse(JSON.stringify({ error: "Server missing Gemini API key" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Wrap the user's prompt so it knows it is acting as a test runner
        const testPrompt = `
You are acting as an AI executing a user-provided prompt snippet inside a playground environment.
Please execute the following instructions to the best of your ability and return the raw output. Do not break character. Do not explain what you are doing.

USER PROMPT:
"""
${prompt}
"""
`;

        const response = await model.generateContent(testPrompt);
        const text = response.response.text();

        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error("[GEMINI_TEST_PROMPT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to test text prompt" }), { status: 500 });
    }
}
