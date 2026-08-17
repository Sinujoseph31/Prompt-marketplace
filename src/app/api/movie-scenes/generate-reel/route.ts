import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VIRAL_VIDEO_TEMPLATES } from '@/lib/movie-scenes/viral-templates';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { prompt, selectedCategory = 'all' } = await req.json();

        if (!prompt || !prompt.trim()) {
            return new NextResponse(
                JSON.stringify({ error: 'Please provide a topic or prompt for the Reel.' }),
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const defaultTemplate = VIRAL_VIDEO_TEMPLATES[0];

        if (!apiKey) {
            // High quality fallback without API key
            return NextResponse.json({
                matchedTemplateId: defaultTemplate.id,
                topText: `POV: ${prompt.toUpperCase()}`,
                bottomText: 'BRO REALLY THOUGHT NOBODY WOULD NOTICE 💀',
                caption: `POV: ${prompt} 😂\n\nTag that one friend who relates to this! 👇 #reels #viral #relatable`,
                hashtags: ['#viralreels', '#relatable', '#memes', '#trending'],
                alternativeOverlays: [
                    { category: 'POV', top: `POV: ${prompt.toUpperCase()}`, bottom: 'EVERY SINGLE TIME 😭' },
                    { category: 'Meme', top: 'NOBODY:', bottom: `ME: ${prompt.toUpperCase()} 💀` },
                    { category: 'Relatable', top: 'HOW IT STARTED vs HOW IT\'S GOING', bottom: prompt.toUpperCase() }
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const availableTemplatesSummary = VIRAL_VIDEO_TEMPLATES.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            vibe: t.vibe,
            tags: t.tags
        }));

        const aiPrompt = `You are a World-Class Viral Reel & TikTok Meme Producer.
A creator entered this topic / prompt:
"${prompt.trim()}"

Available Video Background Templates:
${JSON.stringify(availableTemplatesSummary, null, 2)}

Tasks:
1. Select the single best matching video template ID from the list that fits this joke/vibe (e.g. GTA gameplay for story/satisfying, Pedro Pascal for regret/rollercoaster, Patrick Bateman for sigma/confidence, Walter White for devastation, Steve Carell for panic, Night drive for aesthetic/lonely, Sandesham for Malayalam sarcasm).
2. Generate a punchy, high-retention TOP TEXT (The Hook / Setup in ALL CAPS, e.g. "POV: YOUR SALARY GETS CREDITED", "WHEN YOU ACCIDENTALLY SEND THE SCREENSHOT TO THE SAME PERSON").
3. Generate a funny/satisfying BOTTOM TEXT (The Punchline / Climax in ALL CAPS with emojis).
4. If the prompt contains Malayalam or Manglish (e.g. paisa, kadam, machane, mone, aada, thallu), generate authentic Malayalam / Manglish humor text!
5. Generate 4 alternative text overlays with different comedy formats (POV, Meme, Relatable, Sarcastic).
6. Generate an engaging Instagram Reel caption with emojis and call to action.

Respond ONLY with a valid JSON object matching this schema:
{
  "matched_template_id": "template-id-from-list",
  "top_text": "HOOK TEXT IN ALL CAPS",
  "bottom_text": "PUNCHLINE TEXT IN ALL CAPS WITH EMOJIS",
  "caption": "Complete Instagram caption with emojis and CTA",
  "hashtags": ["#viral", "#reels", "#relatable"],
  "alternative_overlays": [
    { "category": "POV", "top": "POV: ...", "bottom": "..." },
    { "category": "Meme", "top": "ME WHEN...", "bottom": "..." },
    { "category": "Relatable", "top": "...", "bottom": "..." },
    { "category": "Malayalam / Manglish", "top": "...", "bottom": "..." }
  ]
}`;

        const result = await model.generateContent(aiPrompt);
        const text = result.response.text();

        let jsonStr = text;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsed = JSON.parse(jsonStr);
        const matchedTemplate = VIRAL_VIDEO_TEMPLATES.find(t => t.id === parsed.matched_template_id) || VIRAL_VIDEO_TEMPLATES[0];

        return NextResponse.json({
            matchedTemplate: matchedTemplate,
            topText: parsed.top_text || defaultTemplate.defaultTopText,
            bottomText: parsed.bottom_text || defaultTemplate.defaultBottomText,
            caption: parsed.caption || `POV: ${prompt} 😂\n\nDrop a comment if you relate! 👇`,
            hashtags: parsed.hashtags || ['#viral', '#reels', '#explore'],
            alternativeOverlays: parsed.alternative_overlays || []
        });

    } catch (error: any) {
        console.error('Generate Reel API Error:', error);
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Failed to generate reel blueprint' }),
            { status: 500 }
        );
    }
}
