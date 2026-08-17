import { NextResponse } from 'next/server';
import { searchMovieScenes } from '@/lib/movie-scenes/search-service';
import { SceneSearchFilter } from '@/types/movie-scenes';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body: SceneSearchFilter = await req.json();
        const results = await searchMovieScenes(body);
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Movie Scene Search API Error:', error);
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Failed to search movie scenes' }),
            { status: 500 }
        );
    }
}
