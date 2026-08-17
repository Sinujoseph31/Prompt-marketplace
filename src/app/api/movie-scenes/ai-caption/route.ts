import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { sceneTitle, movieTitle, language, dialogue, description, themeCategory = 'POV' } = await req.json();

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            // Fallback generation if no key is configured
            return NextResponse.json({
                captions: [
                    `POV: When salary gets credited and finishes in 2 hours 💀😂`,
                    `That one friend who always says "Account-il paisa illa bro" 😭`,
                    `Tag that friend who relates to this exact feeling! 🎬✨`,
                    `Classic ${movieTitle} moment hits different every single time 🔥`
                ],
                overlays: [
                    { category: 'POV', text: 'POV: Salary Day vs Day 2 💀' },
                    { category: 'Meme', text: 'ME EXPLAINING WHY I NEED MONEY' },
                    { category: 'Malayalam', text: 'അക്കൗണ്ടിൽ പൈസ ഇല്ലാത്ത ഞാൻ 😂' },
                    { category: 'Manglish', text: 'Paisa illatha njan be like 😭' },
                    { category: 'Friendship', text: 'Tag your broke bestie 💸' }
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a viral Instagram Reel & TikTok content director, meme creator, and copywriter.
Analyze this movie scene:
Movie: "${movieTitle}"
Language: "${language}"
Scene: "${sceneTitle}"
Description: "${description}"
Dialogue/Context: "${dialogue || ''}"
Selected Category: "${themeCategory}"

Generate:
1. 5 punchy, viral Instagram Reel Captions with emojis, relatable hooks, and call-to-actions. Include formats like:
   - "POV: ..."
   - "When ..."
   - "Every broke friend's emergency plan..."
   - Highly relatable cultural references (especially Malayalam/Manglish if regional, plus English/Hindi).
2. 8 ultra-short, dynamic Text Overlays (formatted in punchy ALL CAPS or clean typography) ready to place right on top of a 9:16 vertical Reel video. Include varieties in:
   - POV
   - Meme
   - Salary / Broke life
   - Friendship / Relationship
   - Malayalam Unicode (e.g. പൈസ ഇല്ലാത്തപ്പോൾ 😂)
   - Manglish (e.g. Broke aayi irikkumbo...)
   - English / Hindi

Respond ONLY with a valid JSON object matching this schema:
{
  "captions": [
    "POV: Salary day is still 10 days away 😂",
    "When your bank balance says NO 😭"
  ],
  "overlays": [
    { "category": "POV", "text": "POV: ME AFTER CHECKING BANK BALANCE" },
    { "category": "Malayalam", "text": "പൈസ തീർന്ന അവസ്ഥ 💀" },
    { "category": "Manglish", "text": "ATM-il poyi balance nokkiya njan 😂" },
    { "category": "Meme", "text": "WHY ARE YOU RUNNING? 😂" },
    { "category": "Friendship", "text": "TAG THAT ONE BROKE FRIEND" }
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let jsonStr = text;
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsed = JSON.parse(jsonStr);

        return NextResponse.json({
            captions: parsed.captions || [],
            overlays: parsed.overlays || []
        });
    } catch (error: any) {
        console.error('AI Caption API Error:', error);
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Failed to generate captions' }),
            { status: 500 }
        );
    }
}
