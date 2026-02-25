import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleInterested, isInterested } from '@/lib/db';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const userId = (session.user as any).id;

    const { tmdbId, mediaType } = await req.json();
    if (!tmdbId) return NextResponse.json({ error: 'tmdbId required' }, { status: 400 });

    const interested = await toggleInterested(userId, tmdbId, mediaType || 'movie');
    return NextResponse.json({ interested });
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ interested: false });
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const tmdbId = parseInt(searchParams.get('tmdbId') || '0');
    if (!tmdbId) return NextResponse.json({ interested: false });

    const interested = await isInterested(userId, tmdbId);
    return NextResponse.json({ interested });
}
