import { NextResponse } from 'next/server';
import { multiSearch } from '@/lib/tmdb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await multiSearch(query);
        // We only want movies and tv shows
        const filtered = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 5);
        return NextResponse.json({ results: filtered });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
