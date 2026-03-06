import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const promptText = searchParams.get('prompt');
        const modelTarget = searchParams.get('model') || 'huggingface';

        if (!promptText) {
            return new NextResponse(JSON.stringify({ error: "Missing prompt parameter" }), { status: 400 });
        }

        // Clean up the prompt string
        const cleanPrompt = promptText.replace(/\n/g, ' ').trim().substring(0, 1000);
        let buffer: Buffer;

        if (modelTarget === 'together') {
            const togetherKey = process.env.TOGETHER_API_KEY;
            if (!togetherKey) {
                return new NextResponse(JSON.stringify({ error: "Server missing Together API key" }), { status: 500 });
            }

            const response = await fetch("https://api.together.xyz/v1/images/generations", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${togetherKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "black-forest-labs/FLUX.1-schnell-Free",
                    prompt: cleanPrompt,
                    width: 1024,
                    height: 1024,
                    steps: 4,
                    n: 1,
                    response_format: "b64_json"
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                return new NextResponse(JSON.stringify({ error: `Together API Error: ${response.statusText}. Please assure you have limits/credits.` }), { status: response.status });
            }

            const data = await response.json();
            if (!data.data || !data.data[0] || !data.data[0].b64_json) {
                return new NextResponse(JSON.stringify({ error: "Invalid image data returned from Together API" }), { status: 500 });
            }

            const base64Data = data.data[0].b64_json;
            buffer = Buffer.from(base64Data, 'base64');

        } else {
            // Default to Hugging Face
            const hfKey = process.env.HUGGINGFACE_API_KEY;
            if (!hfKey) {
                return new NextResponse(JSON.stringify({ error: "Server missing Hugging Face API key" }), { status: 500 });
            }

            const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
                headers: {
                    Authorization: `Bearer ${hfKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: cleanPrompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                return new NextResponse(JSON.stringify({ error: `Hugging Face API Error: ${response.statusText}. System may be loading.` }), { status: response.status });
            }

            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        }

        // Return the raw buffer to the frontend as a pure image file
        return new NextResponse(buffer as unknown as BodyInit, {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                // Aggressive cache so refreshing the page doesn't eat up API credits
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
        });

    } catch (error: any) {
        console.error("[TOGETHER_IMAGE_GEN_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate AI image" }), { status: 500 });
    }
}
