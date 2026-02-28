import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { imageBase64, mimeType } = await req.json();

        if (!imageBase64 || !mimeType) {
            return new NextResponse(JSON.stringify({ error: "Missing image data" }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new NextResponse(JSON.stringify({ error: "Server missing Gemini API key" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an expert AI Prompt Engineer and Image Analyst. 
Analyze the provided image and reverse-engineer it into a highly detailed text-to-image prompt.

Provide your analysis strictly in the following JSON format. Do not include markdown code block syntax around the JSON (e.g. do not use \`\`\`json). Your entire response must be a valid, parseable JSON object.

{
  "subject": "A detailed description of the main subject and action",
  "environment": "Where is it happening? The background, setting, and props",
  "lighting": "The lighting setup, atmosphere, mood, colors, and camera angle",
  "style": "The art style, medium, or camera/lens specifications",
  "masterPrompt": "A single, incredibly detailed, optimized prompt string combining all the above elements to recreate the exact original image ideally using Midjourney or Stable Diffusion.",
  "remixes": [
    {
      "name": "Cyberpunk Neon",
      "prompt": "The exact same subject, reimagined perfectly in a gritty, neon Cyberpunk style"
    },
    {
      "name": "Dark Fantasy Epic",
      "prompt": "The exact same subject, reimagined in a dark, atmospheric High Fantasy style like Elden Ring"
    },
    {
      "name": "Studio Ghibli Anime",
      "prompt": "The exact same subject, reimagined as a hand-drawn 2D Anime frame from Studio Ghibli"
    },
    {
      "name": "Pixar 3D Render",
      "prompt": "The exact same subject, reimagined as an expressive, colorful 3D animated Pixar movie still"
    }
  ]
}
`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();

        // Clean up markdown backticks in case Gemini disobeys and wraps it
        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        return NextResponse.json({ result: parsedData });

    } catch (error: any) {
        console.error("[GEMINI_IMAGE_TO_PROMPT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to analyze image" }), { status: 500 });
    }
}
