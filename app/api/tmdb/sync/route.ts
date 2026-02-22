import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { syncBangladeshiContent } from '@/lib/tmdb';

export async function POST(req: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== 'admin') {
        return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
    }

    try {
        const result = await syncBangladeshiContent();
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'TMDB sync failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
