import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Increase max duration for Vercel/NextJS serverless functions as image processing can take slightly longer
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;
        const subjectType = (formData.get('subjectType') as string) || 'auto';

        if (!file) {
            return new NextResponse(JSON.stringify({ error: "No image file provided." }), { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("Missing Google Generative AI API Key");
            return new NextResponse(JSON.stringify({ error: "Server error: API key not configured." }), { status: 500 });
        }

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using flash for speed, it handles images well
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const subjectOverrideInstruction = subjectType === 'any_person'
            ? `\nUSER EXPLICIT SUBJECT SELECTION: "ANY PERSON / GENDER-NEUTRAL / VERSATILE HUMAN".
You MUST construct prompts that are versatile and can be applied to ANY person (men, women, girls, or boys). Use adaptable framing such as "A portrait of a person with [detailed facial anatomy, expressions]..." with universal aesthetic lighting, composition, styling, and camera specifications that produce stellar results whether the user chooses to render a man, woman, girl, or boy.\n`
            : subjectType !== 'auto'
            ? `\nUSER EXPLICIT SUBJECT SELECTION:
The user explicitly specified that the subject is: "${subjectType.toUpperCase()}".
You MUST strictly construct all prompts for a "${subjectType}" (e.g. if 'girl' -> young/teen girl; if 'boy' -> young/teen boy; if 'woman' -> adult female; if 'man' -> adult male; if 'non_human' -> focus on landscape/object/animal without human attributes). Ensure zero demographic ambiguity.\n`
            : '';

        const prompt = `You are a world-class AI Prompt Engineer and Forensic Digital Art Analyst.
Your task is to Forensically 'Reverse Engineer' the provided image and generate highly accurate prompts designed primarily for ChatGPT (DALL-E 3 / GPT-4o) and Google Gemini (Imagen 3), with secondary support for Midjourney.
${subjectOverrideInstruction}
CRITICAL FOCUS ON DEMOGRAPHIC, GENDER, FACE & BODY ACCURACY:
If the image contains a person or character:
1. ACCURATE DEMOGRAPHIC & LIFE-STAGE CLASSIFICATION:
   - Identify with 100% precision whether the subject is a:
     * Young Girl (child / toddler / elementary)
     * Teen Girl (adolescent / high-school age)
     * Adult Woman / Female
     * Young Boy (child / toddler / elementary)
     * Teen Boy (adolescent / high-school age)
     * Adult Man / Male
     * Senior Woman / Senior Man
   - State their exact estimated age bracket (e.g., "7-9 years old", "15-17 years old", "26-28 years old").
   - In all generated prompts, ALWAYS explicitly declare this exact age & gender descriptor at the very start (e.g. "A photorealistic portrait of a 15-year-old teenage girl...") so AI models NEVER mistakenly age them up into an adult, down into a child, or swap their gender.
2. FACIAL ANATOMY & LANDMARKS: Describe their exact facial features (eye shape/color, nose profile, lips, jawline/chin, cheekbones, skin tone/texture/pores/freckles, hair style/color/parting/length, facial hair if any, and expression).
3. BODY & SILHOUETTE: Describe their exact build/physique (e.g., petite adolescent frame, athletic slender, broad-shouldered muscular, tall lean), posture, and clothing so the full body identity stays completely identical.
4. IMAGE CLARITY DIAGNOSIS: Assess uploaded image clarity, sharpness, and lighting.

Analyze the image for:
- Subject & Action (with extreme demographic, facial, and body precision if human)
- Artistic Style & Medium (e.g., Raw 35mm photograph, Cinematic film still, Digital 3D, Oil painting)
- Lighting & Atmosphere (e.g., Golden hour directional light, soft rim lighting, volumetric fog)
- Camera & Composition (e.g., 85mm f/1.4 portrait lens, close-up shot, rule of thirds, bokeh)
- Color Palette & Mood

Respond ONLY with a valid JSON object matching exactly this schema:
{
    "reconstructed_prompt": "string", // Rich, ultra-descriptive master prompt (60-120 words) in natural language.
    "chatgpt_prompt": "string", // Prompt specifically optimized for ChatGPT (DALL-E 3 / GPT-4o). If a face is present, includes an instruction like: 'Generate a photo maintaining the exact facial identity and body proportions of: [detailed face & body description]...'
    "gemini_prompt": "string", // Prompt specifically optimized for Google Gemini (Imagen 3), with camera specs, lighting fidelity, and exact facial/body landmarks.
    "midjourney_prompt": "string", // Prompt formatted for Midjourney v6 with stylistic keywords and parameters (e.g., --v 6.1 --ar 16:9, and --cref [IMAGE_URL] if a face is detected).
    "detected_style": "string", // The primary overriding art style (1-3 words)
    "confidence_score": 95, // Overall confidence score between 1 and 100
    "demographics": {
        "identity_classification": "e.g. Teen Girl (15-17 yrs) / Young Boy (7-9 yrs) / Adult Woman (26-28 yrs) / Adult Man (32-35 yrs)",
        "gender": "e.g. Female (Girl) / Female (Woman) / Male (Boy) / Male (Man)",
        "estimated_age": "e.g. 16 years old",
        "body_physique": "e.g. Petite adolescent frame with natural posture",
        "face_shape": "e.g. Soft oval with youthful features and light freckles"
    },
    "sub_metrics": {
        "image_clarity": 92, // 1-100: Score evaluating sharpness, noise, and resolution fidelity of the uploaded image
        "face_retention": 95, // 1-100: Score evaluating facial landmark precision and face-lock capability
        "body_consistency": 88, // 1-100: Score evaluating body type, proportions, posture, and physique consistency
        "lighting_fidelity": 90 // 1-100: Score evaluating lighting accuracy, shadows, and atmosphere
    },
    "key_elements": ["string", "string", "string", "string"], // 4-6 specific visual tags
    "face_detected": true, // true if a human face or identifiable character is present, otherwise false
    "face_consistency_instructions": {
        "chatgpt_tip": "string", // Step-by-step guidance for ChatGPT (e.g., upload reference image and paste this prompt)
        "gemini_tip": "string", // Step-by-step guidance for Gemini (e.g., use with Imagen 3 / Gemini Advanced with reference image)
        "key_facial_traits": ["string", "string", "string"], // 3-5 bullet points of unique facial identifiers extracted from the image
        "body_physique_traits": ["string", "string"] // 2-4 bullet points of body build, stature, posture, and clothing identifiers
    }
}`;

        const imagePart = {
            inlineData: {
                data: base64String,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Extract JSON from potential markdown formatting
        let jsonStr = responseText;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsedJson = JSON.parse(jsonStr);

        return NextResponse.json({ result: parsedJson });

    } catch (error: any) {
        console.error("Reverse Engineer API Error:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to reverse engineer the image. The AI is stumped." }), { status: 500 });
    }
}
