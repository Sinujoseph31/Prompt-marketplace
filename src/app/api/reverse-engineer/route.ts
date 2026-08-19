import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Increase max duration for Vercel/NextJS serverless functions as image processing can take slightly longer
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;
        const subjectType = (formData.get('subjectType') as string) || 'auto';
        const recreationMode = (formData.get('recreationMode') as string) || 'exact_clone';

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const subjectOverrideInstruction = subjectType === 'any_person'
            ? `\nUSER EXPLICIT SUBJECT SELECTION: "ANY PERSON / GENDER-NEUTRAL / VERSATILE HUMAN".
You MUST construct prompts that are versatile and can be applied to ANY person (men, women, girls, or boys). Use adaptable framing such as "A portrait of a person with [detailed facial anatomy, expressions]..." with universal aesthetic lighting, composition, styling, and camera specifications that produce stellar results whether the user chooses to render a man, woman, girl, or boy.\n`
            : subjectType !== 'auto'
            ? `\nUSER EXPLICIT SUBJECT SELECTION:
The user explicitly specified that the subject is: "${subjectType.toUpperCase()}".
You MUST strictly construct all prompts for a "${subjectType}" (e.g. if 'girl' -> young/teen girl; if 'boy' -> young/teen boy; if 'woman' -> adult female; if 'man' -> adult male; if 'non_human' -> focus on landscape/object/animal without human attributes). Ensure zero demographic ambiguity.\n`
            : '';

        const modeInstruction = recreationMode === 'photo_upgrade'
            ? `\nRECREATION TARGET MODE: "PHOTOREALISTIC 35MM UPGRADE".
Transform the core scene into an ultra-high-end cinematic 35mm film photograph shot on Leica / Hasselblad with Kodak Portra 400, authentic optical depth of field, micro-textures, and realistic lighting physics while preserving the exact composition, pose, and subject identity.\n`
            : recreationMode === 'artistic'
            ? `\nRECREATION TARGET MODE: "ARTISTIC / STYLIZED CLONE".
Recreate the exact composition, lighting, subject pose, and color harmony in a high-end digital art / conceptual illustration medium with rich visual textures while keeping the core visual elements identical.\n`
            : `\nRECREATION TARGET MODE: "1:1 EXACT CLONE (MAXIMUM PRECISION)".
Your primary goal is absolute 1:1 visual clone fidelity. Deconstruct every single pixel element—exact attire, fabric weave, background objects, lighting angle, shadow depth, camera lens, eye gaze vector, skin texture, color temperature, and aspect ratio—so the generated prompt produces an image virtually indistinguishable from the original.\n`;

        const prompt = `You are the World's Foremost Reverse-Engineering Image Analyst and Prompt Architect.
Your mission is to perform an exhaustive, 7-layer forensic deconstruction of the provided image to generate PROMPTS THAT WILL RECREATE THIS EXACT PICTURE WITH NEAR-IDENTICAL PRECISION across ChatGPT (DALL-E 3 / GPT-4o), Google Gemini (Imagen 3), Midjourney v6.1, and FLUX.1 (Dev / Schnell).

${subjectOverrideInstruction}
${modeInstruction}

CRITICAL RECREATION PROBLEM TO SOLVE:
Generic prompts (e.g., "a woman in a room with nice lighting") cause AI generators to hallucinate random backgrounds, random clothing, random lighting, and distorted faces—producing a totally different image.
To achieve an EXACT 1:1 CLONE, you MUST forensically extract all 7 essential visual layers:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7-LAYER FORENSIC RECREATION BLUEPRINT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. LAYER 1: VISUAL MEDIUM & ARTISTIC PIPELINE
   - Exact Medium: (e.g., 35mm analog film photography, medium format studio portrait, 8k cinematic anamorphic film still, candid Polaroid 600, 3D Octane/Unreal Engine 5 render, digital concept painting, anime/manga cel-shaded, oil painting).
   - Film Stock / Sensor / Render Texture: (e.g., Kodak Portra 400, Cinestill 800T, Fujifilm Superia, crisp digital RAW, authentic film grain, matte shadows, sub-surface scattering).

2. LAYER 2: SUBJECT IDENTITY, ANATOMY, EXACT POSE & EYE GAZE
   - Demographics: Precise age range (e.g., "24-year-old woman", "16-year-old teenage boy"), ethnicity/heritage, skin tone and undertone.
   - Facial & Physical Features: Exact eye shape and iris color, eyebrow arch, nose bridge and tip shape, lip fullness and shape, jawline, cheekbones, natural skin pores, freckles, moles, blemishes.
   - Hair: Exact color, parting, texture (wavy, straight, coily, slicked back), length, styling, stray strands.
   - Expression & Emotion: Exact subtle micro-expression (e.g., enigmatic slight smirk, intense piercing stare, melancholic gaze, joyful candid laugh).
   - Gaze Direction: Exact vector relative to the camera (e.g., "looking directly into the lens with piercing eye contact", "gazing 45 degrees to the right out of frame", "looking downward pensively").
   - Pose & Posture: Exact head tilt angle, shoulder orientation, body angle, spine curvature, hand and finger placement, seated/standing posture.

3. LAYER 3: WARDROBE, MATERIALS & ACCESSORIES
   - Garments: Item-by-item breakdown of every visible piece (garment type, exact color hue, cut/neckline, fit).
   - Materials & Textures: Fabric weave (e.g., chunky cable-knit wool, distressed washed denim, vintage worn black leather, ribbed cotton, sheer silk, tailored linen).
   - Accessories & Details: Necklaces, earrings, rings, watches, glasses/frames, hats, tattoos, scars, nail polish, makeup (eyeliner, lip gloss, blush).

4. LAYER 4: ENVIRONMENT, BACKGROUND & SPATIAL DEPTH LAYERS
   - Setting: Specific location and context (e.g., dimly lit 1980s neon diner booth, sun-drenched minimalist Scandinavian loft, misty pine forest at twilight).
   - Foreground, Midground, Background: Specific props, furniture, architectural elements, windows, wall textures, wallpaper, plants, distant light sources.
   - Atmospheric Details: Light fog, haze, dust motes, rain droplets on glass, steam, neon reflections, depth-of-field background blur.

5. LAYER 5: LIGHTING PHYSICS & SHADOW ARCHITECTURE
   - Key Light: Source type, direction, angle, height, intensity, softness/hardness (e.g., "soft diffused golden hour sunlight streaming from a 45-degree angle on the upper left").
   - Fill & Rim Light: Subtle fill light lifting shadow details, edge/rim light separating subject from background, hair highlight.
   - Practical & Ambient Lights: Warm lamps, neon signs, candle flickers, monitor glow.
   - Color Temperature: Warm tungsten (2800-3200K), neutral daylight (5000-5600K), cool overcast (6500K), or colored gels (magenta/cyan).
   - Shadow Falloff: Deep sharp cast shadows vs smooth gradual chiaroscuro roll-off.

6. LAYER 6: CAMERA, OPTICS & COMPOSITION GEOMETRY
   - Shot Framing: (e.g., extreme close-up macro, close-up portrait, chest-up bust shot, medium half-body shot, three-quarter shot, full-body environmental shot).
   - Camera Angle: (e.g., eye-level neutral, low-angle hero perspective, high-angle downward tilt, Dutch angle).
   - Lens & Aperture: (e.g., 85mm f/1.4 for creamy bokeh, 35mm f/2.0 for environmental portrait, 50mm f/1.8 natural field of view, 24mm wide angle).
   - Compositional Rules: (e.g., rule of thirds, centered symmetrical balance, leading lines, negative space).
   - Aspect Ratio: Estimate the aspect ratio of the image (e.g., "1:1", "4:5", "3:4", "2:3", "16:9", "9:16").

7. LAYER 7: COLOR PALETTE & COLOR GRADING
   - Dominant Color Palette: 4 to 6 key color tones.
   - Contrast & Tonal Curve: High-contrast punchy, muted vintage film matte, crushed blacks, glowing highlights.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT PROMPT REQUIREMENTS FOR GENERATORS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- "reconstructed_prompt": The Master 1:1 Clone Prompt (140-220 words). A rich, seamless, hyper-detailed narrative combining all 7 layers to allow ANY AI generator to reproduce the exact picture.
- "chatgpt_prompt": Formatted specifically for ChatGPT (DALL-E 3 / GPT-4o). Natural, vivid sentences describing the complete scene, subject, attire, lighting, and optical realism without meta-placeholders or bracketed text.
- "gemini_prompt": Formatted specifically for Google Gemini (Imagen 3). Structured with optical photographic parameters (e.g. 85mm f/1.4 lens, soft directional lighting, realistic subsurface skin scattering, authentic material textures, and precise spatial composition).
- "midjourney_prompt": Clean comma-separated high-impact descriptors covering medium, subject, wardrobe, environment, lighting, camera specs, color grade, ending with "--style raw --v 6.1 --ar [aspect_ratio]". (Do NOT include invalid placeholder text like "[IMAGE_URL]").
- "flux_prompt": Formatted specifically for FLUX.1 (Dev / Schnell). Dense, highly descriptive natural language prompt that FLUX follows with maximum fidelity.
- "face_lock_dna": Standalone 40-60 word ultra-dense biometric facial DNA description for locking identity across all AI tools.
- "negative_prompt": Tailored negative prompt to eliminate common AI artifacts (e.g., "blurry, low quality, bad anatomy, deformed fingers, extra limbs, plastic skin, 3d render, cartoon, oversaturated, watermark, text").

Respond ONLY with a valid JSON object matching exactly this schema:
{
    "reconstructed_prompt": "string",
    "chatgpt_prompt": "string",
    "gemini_prompt": "string",
    "midjourney_prompt": "string",
    "flux_prompt": "string",
    "face_lock_dna": "string",
    "negative_prompt": "string",
    "detected_style": "string",
    "aspect_ratio": "string",
    "confidence_score": 98,
    "demographics": {
        "identity_classification": "string",
        "gender": "string",
        "estimated_age": "string",
        "body_physique": "string",
        "face_shape": "string"
    },
    "sub_metrics": {
        "image_clarity": 95,
        "face_retention": 98,
        "body_consistency": 94,
        "lighting_fidelity": 96,
        "composition_accuracy": 97,
        "styling_precision": 95
    },
    "key_elements": ["string", "string", "string", "string", "string", "string"],
    "face_detected": true,
    "scene_breakdown": {
        "medium_and_style": "string",
        "camera_and_optics": "string",
        "lighting_and_atmosphere": "string",
        "subject_and_pose": "string",
        "wardrobe_and_styling": "string",
        "environment_and_background": "string",
        "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"]
    },
    "face_consistency_instructions": {
        "chatgpt_tip": "string",
        "gemini_tip": "string",
        "midjourney_tip": "string",
        "flux_tip": "string",
        "key_facial_traits": ["string", "string", "string", "string"],
        "body_physique_traits": ["string", "string"]
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
