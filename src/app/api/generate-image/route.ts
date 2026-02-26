import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const promptText = searchParams.get('prompt');

        if (!promptText) {
            return new NextResponse(JSON.stringify({ error: "Missing prompt parameter" }), { status: 400 });
        }

        const hfToken = process.env.HUGGINGFACE_API_KEY;
        if (!hfToken) {
            return new NextResponse(JSON.stringify({ error: "Server missing HuggingFace API key" }), { status: 500 });
        }

        // Clean up the prompt string before sending to HF
        const cleanPrompt = promptText.replace(/\n/g, ' ').trim().substring(0, 1000);

        // Fetching directly from Hugging Face's global router for SDXL
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                headers: {
                    Authorization: `Bearer ${hfToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: cleanPrompt }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[HF_RESPONSE_ERROR]", response.status, errorText);
            return new NextResponse(JSON.stringify({ error: `Hugging Face API Error: ${response.statusText}` }), { status: response.status });
        }

        // Convert the raw blob into an arraybuffer so Next.js can stream it to the client as an image block
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                // Aggressive cache so refreshing the page doesn't eat up the user's free API credits
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
        });

    } catch (error: any) {
        console.error("[HF_IMAGE_GEN_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate AI image" }), { status: 500 });
    }
}
