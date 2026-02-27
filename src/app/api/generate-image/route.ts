import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const promptText = searchParams.get('prompt');

        if (!promptText) {
            return new NextResponse(JSON.stringify({ error: "Missing prompt parameter" }), { status: 400 });
        }

        const togetherKey = process.env.TOGETHER_API_KEY;
        if (!togetherKey) {
            return new NextResponse(JSON.stringify({ error: "Server missing Together API key" }), { status: 500 });
        }

        // Clean up the prompt string
        const cleanPrompt = promptText.replace(/\n/g, ' ').trim().substring(0, 1000);

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
            console.error("[TOGETHER_RESPONSE_ERROR]", response.status, errorText);
            return new NextResponse(JSON.stringify({ error: `Together API Error: ${response.statusText}` }), { status: response.status });
        }

        const data = await response.json();

        if (!data.data || !data.data[0] || !data.data[0].b64_json) {
            console.error("[TOGETHER_INVALID_JSON_RESPONSE]", data);
            return new NextResponse(JSON.stringify({ error: "Invalid image data format returned from Together API" }), { status: 500 });
        }

        // Decode the base64 string directly into a raw binary buffer
        const base64Data = data.data[0].b64_json;
        const buffer = Buffer.from(base64Data, 'base64');

        // Return the raw buffer to the frontend as a pure image file
        return new NextResponse(buffer, {
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
