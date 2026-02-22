import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllMovies, createMovie, deleteMovie } from '@/lib/db';

export async function GET() {
    const movies = getAllMovies();
    return NextResponse.json(movies);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== 'admin') {
        return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
    }

    const data = await req.json();
    const result = createMovie({
        tmdb_id: null,
        title: data.title,
        original_title: data.original_title || null,
        overview: data.overview || null,
        release_year: data.release_year ? parseInt(data.release_year) : null,
        poster_url: data.poster_url || null,
        backdrop_url: null,
        type: data.type || 'movie',
        source: 'custom',
        genres: JSON.stringify(data.genres || []),
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== 'admin') {
        return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
    }

    const { id } = await req.json();
    deleteMovie(parseInt(id));
    return NextResponse.json({ success: true });
}
