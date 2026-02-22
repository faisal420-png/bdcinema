import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createReview, getMovieByTmdbId, upsertTmdbMovie } from '@/lib/db';
import { getTmdbDetails, img, backdrop } from '@/lib/tmdb';

const VALID_RATINGS = ['disaster', 'timepass', 'go_for_it', 'perfection'];

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        const { movieId, tmdbId, type = 'movie', meterRating, body } = await req.json();

        if ((!movieId && !tmdbId) || !meterRating) {
            return NextResponse.json({ error: 'Movie ID and rating are required.' }, { status: 400 });
        }

        if (!VALID_RATINGS.includes(meterRating)) {
            return NextResponse.json({ error: 'Invalid rating.' }, { status: 400 });
        }

        const userId = (session.user as { id: string }).id;

        let targetMovieId = parseInt(movieId);

        // If no local movieId was provided, we're reviewing a TMDB global title
        if (isNaN(targetMovieId) || !targetMovieId) {
            if (!tmdbId) {
                return NextResponse.json({ error: 'Valid Movie ID required.' }, { status: 400 });
            }

            // Check if it was synced recently by someone else
            const existingLocal = await getMovieByTmdbId(tmdbId);
            if (existingLocal) {
                targetMovieId = existingLocal.id;
            } else {
                // Auto-sync the TMDB movie
                try {
                    const tmdbData = await getTmdbDetails(tmdbId, type as 'movie' | 'tv');

                    // Parse genres locally for the sync
                    let genres: string[] = [];
                    const t = tmdbData as any;
                    if (t.genres && Array.isArray(t.genres)) genres = t.genres.map((g: any) => g.name);

                    const newLocalMovie = await upsertTmdbMovie({
                        tmdb_id: tmdbData.id,
                        title: tmdbData.title || tmdbData.name || 'Unknown',
                        original_title: tmdbData.original_title || tmdbData.original_name || null,
                        overview: tmdbData.overview || null,
                        release_year: tmdbData.release_date ? parseInt(tmdbData.release_date.split('-')[0]) : tmdbData.first_air_date ? parseInt(tmdbData.first_air_date.split('-')[0]) : null,
                        poster_url: img(tmdbData.poster_path),
                        backdrop_url: backdrop(tmdbData.backdrop_path),
                        type: type as 'movie' | 'series',
                        source: 'tmdb',
                        genres: JSON.stringify(genres),
                    });

                    targetMovieId = newLocalMovie.id;
                } catch (e) {
                    console.error('Failed to sync TMDB movie:', e);
                    return NextResponse.json({ error: 'Failed to sync title data.' }, { status: 500 });
                }
            }
        }

        await createReview(targetMovieId, userId, meterRating, body || '');

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        console.error('Review error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
