import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { prompt, model } = await req.json();

        if (!prompt) {
            return new NextResponse(JSON.stringify({ error: "Missing prompt parameter" }), { status: 400 });
        }

        const modelTarget = model || 'gemini';

        // Wrap the user's prompt so it knows it is acting as a test runner
        const systemInstruction = `You are acting as an AI executing a user-provided prompt snippet inside a playground environment. Please execute the instructions to the best of your ability and return the raw output. Do not break character. Do not explain what you are doing.`;

        if (modelTarget === 'chatgpt') {
            const openaiKey = process.env.OPENAI_API_KEY;
            // Since OpenAI key is missing in their env, we expect it to fail gracefully and tell them to add it.
            if (!openaiKey) {
                return new NextResponse(JSON.stringify({ error: "Missing OPENAI_API_KEY in .env.local. Please add it to use ChatGPT models." }), { status: 500 });
            }

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                return new NextResponse(JSON.stringify({ error: errData.error?.message || "ChatGPT API Error" }), { status: res.status });
            }

            const data = await res.json();
            const text = data.choices[0]?.message?.content || "";
            return NextResponse.json({ result: text });

        } else {
            // Default to Gemini
            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            if (!apiKey) {
                return new NextResponse(JSON.stringify({ error: "Server missing Gemini API key" }), { status: 500 });
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const geminiModel = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemInstruction
            });

            const response = await geminiModel.generateContent(prompt);
            const text = response.response.text();
            return NextResponse.json({ result: text });
        }

    } catch (error: any) {
        console.error("[GEMINI_TEST_PROMPT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to test text prompt" }), { status: 500 });
    }
}
