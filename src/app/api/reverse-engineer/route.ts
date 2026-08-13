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

        const prompt = `You are the World's Foremost Forensic Digital Art and Facial Biometric Reverse-Engineering Analyst.
Your mission is to perform a rigorous forensic deconstruction of the provided image to generate PROMPTS WITH MAXIMUM FACIAL AND ANATOMICAL IDENTITY RETENTION for ChatGPT (GPT-4o / DALL-E 3), Google Gemini (Imagen 3), and Midjourney v6.1.
${subjectOverrideInstruction}
CRITICAL MISSION: ZERO FACE-DRIFT & MAXIMUM BIOMETRIC IDENTITY MATCH
Standard AI prompts produce low face match because they are generic (e.g. "a pretty woman with brown hair"). To achieve maximum face likeness and eliminate face drift across AI generators, execute deep anthropometric feature extraction:

1. DEMOGRAPHIC & LIFE-STAGE LOCK:
   - Identify with 100% precision whether the subject is a:
     * Young Girl (child / toddler, e.g. "7-9 years old")
     * Teen Girl (adolescent, e.g. "15-17 years old")
     * Adult Woman / Female (e.g. "26-28 years old")
     * Young Boy (child / toddler, e.g. "6-8 years old")
     * Teen Boy (adolescent, e.g. "15-17 years old")
     * Adult Man / Male (e.g. "30-34 years old")
     * Senior Woman / Senior Man
   - Start EVERY prompt with this exact demographic framing (e.g. "A photorealistic portrait of a 16-year-old teenage girl...") so AI models NEVER mistakenly age them up, down, or swap their gender.

2. FORENSIC FACIAL ANATOMY & BIOMETRIC ANCHOR:
   Extract and describe in microscopic detail:
   - Eye Geometry: Exact shape (almond, hooded, monolid, round), canthal tilt, iris pigmentation & sub-tones, limbal ring definition, pupil spacing.
   - Eyebrows: Arch angle, thickness, hair stroke texture.
   - Nasal Architecture: Bridge height/width, dorsal slope, tip shape (rounded, button, pointed, refined), columella, and nostril flare.
   - Oral Anatomy: Cupid's bow definition, upper vs lower lip fullness ratio, vermilion border, resting lip corner expression.
   - Craniofacial Contours: Zygomatic arch (cheekbones) height, jawline angle (soft oval, angular, defined square), chin projection, forehead curvature.
   - Epidermal Micro-texture: Exact skin undertone (warm olive, cool rosy, golden bronze, deep ebony), natural visible skin pores, authentic freckles, beauty marks, absence of artificial airbrushed smoothness.
   - Hair Architecture: Natural parting, strand thickness, texture (coarse coils, wavy, straight), hair highlights, hairline baby hairs.

3. MODEL-SPECIFIC PROMPT ENCODING:
   - "chatgpt_prompt": Formatted to prevent DALL-E 3 prompt expansion drift. Uses explicit identity-lock commands: "A realistic photograph maintaining the exact facial identity and facial bone structure of a [age, demographic]: [complete facial biometric anchor]. [Lighting, camera, attire, and atmosphere]. Realistic skin texture with visible micro-pores, no artificial smoothing, zero facial drift."
   - "gemini_prompt": Structured for Google Gemini / Imagen 3 with authentic photographic optical parameters (85mm f/1.4 lens, softbox directional lighting, realistic subsurface skin scattering, exact facial landmark ratios).
   - "midjourney_prompt": Clean comma-separated keyword prompt with stylistic modifiers, authentic camera tags, and "--v 6.1 --ar 16:9 --cref [IMAGE_URL] --cw 100".

4. "face_lock_dna": A standalone 40-60 word ultra-dense biometric facial DNA description designed to be copied and pasted into any image generator, custom GPT, or system prompt to lock facial identity across multiple generations.

Respond ONLY with a valid JSON object matching exactly this schema:
{
    "reconstructed_prompt": "string", // Rich, ultra-descriptive master prompt (60-120 words) in natural language.
    "chatgpt_prompt": "string", // Prompt specifically optimized for ChatGPT (DALL-E 3 / GPT-4o) with anti-drift facial lock commands.
    "gemini_prompt": "string", // Prompt specifically optimized for Google Gemini (Imagen 3), with 85mm camera specs, lighting fidelity, and exact facial/body landmarks.
    "midjourney_prompt": "string", // Prompt formatted for Midjourney v6 with stylistic keywords and parameters (e.g., --v 6.1 --ar 16:9, and --cref [IMAGE_URL] if a face is detected).
    "face_lock_dna": "string", // Standalone 40-60 word ultra-dense biometric facial DNA description for locking identity across all AI tools.
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
        "key_facial_traits": ["string", "string", "string", "string"], // 3-5 bullet points of unique facial identifiers extracted from the image
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
