import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const productDescription = (formData.get('productDescription') as string) || '';
        const scenesJson = (formData.get('scenes') as string) || '[]';
        const customScene = (formData.get('customScene') as string) || '';

        if (!file && !productDescription.trim()) {
            return new NextResponse(JSON.stringify({ error: "Please upload a product photo or provide a product description." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        let requestedScenes: { id: string; title: string; prompt_cue: string }[] = [];
        try {
            requestedScenes = JSON.parse(scenesJson);
        } catch {
            requestedScenes = [];
        }

        if (customScene.trim()) {
            requestedScenes.push({
                id: 'custom_scene',
                title: 'Custom Commercial Campaign',
                prompt_cue: customScene.trim()
            });
        }

        if (requestedScenes.length === 0) {
            return new NextResponse(JSON.stringify({ error: "Please select at least one commercial advertising scene." }), { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const scenesDescription = requestedScenes.map(s => `- ID: "${s.id}", Title: "${s.title}", Backdrop & Mood: "${s.prompt_cue}"`).join('\n');

        const prompt = `You are the World's Premier Commercial Product Photographer, Advertising Art Director, and AI Prompt Architect.
Your task is to analyze the provided product (from the reference image or description) and generate high-converting, luxury commercial advertising photography prompts tailored specifically for:
1. ChatGPT (GPT-4o / DALL-E 3) - Natural language commercial narrative with strict product packaging preservation.
2. Google Gemini (Imagen 3) - High-fidelity optical setup (macro lens, studio softbox, specular highlights, ray-traced reflections, authentic depth of field).
3. Midjourney v6.1 - Commercial advertising tags with studio lighting and --ar 1:1 or --ar 16:9.

CRITICAL FOCUS ON PRODUCT INTEGRITY & PACKAGING PRESERVATION:
1. Extract the product's precise packaging geometry, bottle/can/box dimensions, material textures (e.g. frosted glass, brushed aluminum, matte plastic, embossed typography, liquid clarity, gold foil accents), and label styling.
2. For EVERY requested commercial scene listed below, construct an ultra-detailed, commercial-grade prompt where the product is the hero center-piece, perfectly lit and integrated into the scene environment without altering the product's packaging or branding.

Requested Commercial Scenes:
${scenesDescription}

Product Context / Input:
${productDescription || "Analyze the provided reference product photo directly."}

Respond ONLY with a valid JSON object matching this schema:
{
    "product_dna": {
        "product_name": "Short, catchy commercial title (e.g. 'Aura - Frosted Amber Vitamin C Serum')",
        "category": "Product Category (e.g. 'Luxury Skincare & Cosmetics')",
        "materials_texture": "Specific materials breakdown (e.g. 'Heavy frosted amber glass bottle with matte black dropper cap and embossed white serif typography')",
        "key_packaging_features": [
            "Specific feature 1 (e.g. Cylindrical amber glass container with translucent liquid depth)",
            "Specific feature 2 (e.g. Minimalist monochrome typography on matte white label)",
            "Specific feature 3 (e.g. Subtle golden dropper rim with pristine metallic reflection)"
        ],
        "full_identity_anchor": "A 40-word standalone packaging description paragraph used to anchor the exact product shape, material, and branding across all AI generators."
    },
    "scenes": [
        {
            "id": "string (matching scene ID)",
            "title": "string (scene title)",
            "chatgpt_prompt": "Ultra-detailed commercial photography prompt for ChatGPT/GPT-4o keeping the exact product packaging described in full_identity_anchor perfectly preserved.",
            "gemini_prompt": "Ultra-detailed commercial prompt for Google Gemini (Imagen 3) with 85mm or 100mm macro lens specs, softbox key lighting, realistic reflections, and scene atmosphere.",
            "midjourney_prompt": "Midjourney v6.1 commercial advertising prompt with --ar 1:1 --v 6.1 --style raw"
        }
    ],
    "ad_strategy_tip": "One concise, high-value commercial marketing rule of thumb for running ads with this product aesthetic on Shopify, Amazon, or Instagram."
}`;

        let result;
        if (file) {
            const buffer = await file.arrayBuffer();
            const base64String = Buffer.from(buffer).toString('base64');
            const mimeType = file.type;

            const imagePart = {
                inlineData: {
                    data: base64String,
                    mimeType
                }
            };

            result = await model.generateContent([prompt, imagePart]);
        } else {
            result = await model.generateContent(prompt);
        }

        const responseText = result.response.text();

        let jsonStr = responseText;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsedJson = JSON.parse(jsonStr);

        return NextResponse.json({ result: parsedJson });

    } catch (error: any) {
        console.error("Product Studio API Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || "Failed to generate product commercial prompts." }), { status: 500 });
    }
}
