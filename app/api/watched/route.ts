import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleWatched, isWatched } from '@/lib/db';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const userId = (session.user as any).id;

    const { movieId } = await req.json();
    if (!movieId) return NextResponse.json({ error: 'movieId required' }, { status: 400 });

    const watched = await toggleWatched(userId, movieId);
    return NextResponse.json({ watched });
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ watched: false });
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const movieId = parseInt(searchParams.get('movieId') || '0');
    if (!movieId) return NextResponse.json({ watched: false });

    const watched = await isWatched(userId, movieId);
    return NextResponse.json({ watched });
}
