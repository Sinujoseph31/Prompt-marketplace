import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { prompt, requires_image_reference } = await req.json();

        if (!prompt) {
            return new NextResponse(JSON.stringify({ error: "Missing prompt parameter" }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new NextResponse(JSON.stringify({ error: "Server missing Gemini API key" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const testPrompt = `
You are an expert AI Prompt Engineer. A user has written a draft prompt for an AI Model (like ChatGPT, Midjourney, etc.), but it might be poorly formatted, vague, or lacking structure.

Your job is to REWRITE and ENHANCE their prompt. 
Make it extremely clear, highly detailed, well-structured, and explicitly format it so a language model can understand boundaries and exact instructions. Do NOT drastically change their core goal, just make it professionally formatted.

${requires_image_reference ? `
CRITICAL MULTIMODAL INSTRUCTION: The user intends to use this prompt alongside an uploaded photo of a person as a structural reference. 
You MUST literally start your rewritten prompt exactly with this text:
"**[ACTION REQUIRED: Upload the reference photo of the subject first]**. Using the attached image as an absolute structural framework, analyze and lock in the exact facial features, proportions, and bone structure tracking. Render the person seamlessly in the following scenario: "

...and then follow it with the enhanced version of their draft prompt. Prioritize instructing the AI to preserve facial accuracy above all artistic liberties.`
                : ''}

Respond strictly with the newly written prompt. Do not include introductory text like "Here is the enhanced prompt:". If the prompt is already perfect, just return it.

USER'S DRAFT PROMPT:
"""
${prompt}
"""
`;

        const response = await model.generateContent(testPrompt);
        const text = response.response.text();

        // Basic clean up in case the model adds backticks
        const cleanText = text.replace(/^```[a-z]*\n/i, '').replace(/```$/i, '').trim()

        return NextResponse.json({ result: cleanText });

    } catch (error: any) {
        console.error("[GEMINI_ENHANCE_PROMPT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to enhance prompt" }), { status: 500 });
    }
}
