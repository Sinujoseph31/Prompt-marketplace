import { GoogleGenerativeAI } from '@google/generative-ai'

// Optional: increase timeout for the serverless function since image processing could take a bit longer
export const maxDuration = 60; // seconds

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Missing Gemini API Key in environment.' }), { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        // Using gemini-2.5-flash since 1.5 is deprecated/hidden for this API tier
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const { imageBase64, category } = await req.json()

        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 })
        }

        let categoryContext = '';
        if (category && category !== 'Any') {
            categoryContext = `The user specifically wants prompts tailored for the category/theme: "${category}". Please ensure all generated prompts strongly align with this specific theme.`;
        }

        // The exact prompt to force structural JSON back from Gemini natively
        const promptText = `
            Analyze the attached image.
            First, describe the image in detail: objects, subjects, and core composition.
            ${categoryContext}
            Then, generate 5 to 7 highly aesthetic, trending text-to-image AI prompts that recreate the core subject/composition of this image in drastically different, beautiful styles.
            Each prompt MUST be highly detailed, comma-separated keywords, and optimized for image generators like Midjourney or Stable Diffusion. 
            Styles should include trending aesthetics like: Cinematic, Cyberpunk, Watercolor, 3D Render, Anime/Studio Ghibli, Dark Fantasy, or Minimalist Line Art (unless a specific theme was requested above, in which case prioritize that theme).
            Prefix each prompt with the style name for clarity (e.g., "Style: A detailed...").

            Return EXACTLY a valid JSON object with the following structure, and nothing else (no markdown blocks like \`\`\`json):
            {
                "analysis": "String describing the image...",
                "prompts": ["Prompt 1...", "Prompt 2...", "Prompt 3...", "Prompt 4...", "Prompt 5..."]
            }
        `;

        // Parse mimeType and base64 payload out of the standard Data URI format explicitly
        const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
        const base64Data = imageBase64.split(",")[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        };

        const result = await model.generateContent([promptText, imagePart]);
        const responseText = result.response.text();

        // Gemini might still wrap response in markdown even when told not to, so attempt to clean it.
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonObject = JSON.parse(cleanedText);

        return new Response(JSON.stringify(jsonObject), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error: any) {
        console.error('[GENERATE_PROMPTS_ERROR]', error)
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate prompts from Gemini.' }), { status: 500 })
    }
}
