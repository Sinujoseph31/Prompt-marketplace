import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { text, style, imageBase64, mimeType } = await req.json();

        if (!text && !imageBase64) {
            return new NextResponse(JSON.stringify({ error: "Provide text or an image to generate a prompt." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new NextResponse(JSON.stringify({ error: "Server missing Gemini API key" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an expert AI Prompt Engineer for advanced models like Midjourney V6, DALL-E 3, and Stable Diffusion.
${imageBase64 ? "Analyze the core subject and mood of the provided image alongside the user's text." : "Deeply analyze the user's text request."}
Your task is to generate 4 UNIQUE, highly detailed, and creative text-to-image prompts based on the user's input, but perfectly tailored to the requested artistic style.

User Idea: "${text || 'Recreate the core essence of this reference image but elevate it creatively.'}"
Requested Style: "${style || 'Highly detailed, photorealistic, visually stunning'}"

CRITICAL: Return YOUR RESPONSE STRICTLY AS A JSON ARRAY of 4 objects. Do not include markdown formatting like \`\`\`json. Every object must have these exact keys:
[
  {
    "title": "A short, catchy name for this variation (e.g., 'Neon Noir Cinematic')",
    "focus": "A brief sentence explaining what this variation emphasizes (e.g., 'Focuses on dramatic volumetric lighting and a low-angle perspective.')",
    "prompt": "The long, highly detailed master prompt string ready to be copied and pasted securely."
  },
  ...
]

Ensure each of the 4 prompts approaches the idea slightly differently (e.g., different camera lenses, lighting setups, color grading, or conceptual twists) while maintaining the core subject and chosen style. Make the prompts incredibly vivid and descriptive.
`;

        const payload = [];
        if (imageBase64) {
            payload.push(prompt);
            payload.push({
                inlineData: {
                    data: imageBase64,
                    mimeType
                }
            });
        } else {
            payload.push(prompt);
        }

        const result = await model.generateContent(payload);
        const returnedText = result.response.text();

        // Clean up markdown backticks in case Gemini ignores instructions
        const cleanJson = returnedText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        if (!Array.isArray(parsedData) || parsedData.length !== 4) {
            throw new Error("AI did not return exactly 4 prompt variations in JSON format.");
        }

        return NextResponse.json({ result: parsedData });

    } catch (error: any) {
        console.error("[GEMINI_GENERATE_PROMPT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate prompt variations. Please try again." }), { status: 500 });
    }
}
