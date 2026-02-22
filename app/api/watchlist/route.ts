import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleWatchlist } from '@/lib/db';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { movieId } = await request.json();

        if (!movieId || typeof movieId !== 'number') {
            return new NextResponse('Invalid movie ID', { status: 400 });
        }

        toggleWatchlist(parseInt(session.user.id), movieId);

        return NextResponse.json({ success: true });
    } catch {
        return new NextResponse('Internal Error', { status: 500 });
    }
}
