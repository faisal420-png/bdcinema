import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMovieById, getReviewsByMovieId, getReviewByUserAndMovie, isInWatchlist } from '@/lib/db';
import { getTmdbDetails, img, backdrop, type TmdbResult } from '@/lib/tmdb';
import { auth } from '@/lib/auth';
import { ReviewForm } from '@/components/ReviewForm';
import { MeterBadge, type MeterRatingValue } from '@/components/MeterRating';
import { WatchlistToggle } from '@/components/WatchlistToggle';
import { SharedPoster } from '@/components/SharedPoster';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> };

export default async function MovieDetailPage({ params, searchParams }: Props) {
    const { id: idParam } = await params;
    const { type } = await searchParams;

    const id = parseInt(idParam);
    if (isNaN(id)) notFound();

    // 1. Try local DB first
    const localMovie = await getMovieById(id);

    // 2. Determine TMDB fetch parameters
    let tmdbId = localMovie?.tmdb_id || null;
    let mediaType = localMovie?.type || type || 'movie';
    const fetchMediaType = mediaType === 'series' ? 'tv' : mediaType;

    if (!tmdbId && !localMovie) {
        tmdbId = id; // Assume ID is a TMDB ID if not found locally
    }

    // 3. Fetch TMDB data if possible
    let tmdbData: TmdbResult | null = null;
    if (tmdbId) {
        try {
            tmdbData = await getTmdbDetails(tmdbId, fetchMediaType as 'movie' | 'tv');
        } catch {
            console.error(`Failed to fetch TMDB data for ${fetchMediaType} ${tmdbId}`);
        }
    }

    // 4. Construct unified movie object gracefully
    if (!localMovie && !tmdbData) notFound();

    const m = {
        id: localMovie?.id || tmdbData?.id || id,
        title: localMovie?.title || tmdbData?.title || tmdbData?.name || 'Unknown',
        original_title: localMovie?.original_title || tmdbData?.original_title || tmdbData?.original_name || null,
        overview: localMovie?.overview || tmdbData?.overview || null,
        release_year: localMovie?.release_year || (tmdbData?.release_date ? parseInt(tmdbData.release_date.split('-')[0]) : tmdbData?.first_air_date ? parseInt(tmdbData.first_air_date.split('-')[0]) : null),
        poster_url: localMovie?.poster_url || img(tmdbData?.poster_path || null) || null,
        backdrop_url: localMovie?.backdrop_url || backdrop(tmdbData?.backdrop_path || null) || null,
        type: localMovie?.type || mediaType,
        source: localMovie?.source || 'tmdb',
    };

    const runtime = tmdbData?.runtime || tmdbData?.episode_run_time?.[0];

    // Parse genres
    let genres: string[] = [];
    if (localMovie?.genres) {
        try {
            const parsed = JSON.parse(localMovie.genres);
            genres = Array.isArray(parsed) ? parsed : [localMovie.genres];
        } catch {
            genres = [localMovie.genres];
        }
    }

    if (genres.length === 0 && tmdbData) {
        const t = tmdbData as any;
        if (t.genres && Array.isArray(t.genres)) {
            genres = t.genres.map((g: any) => g.name);
        }
    }

    // Extract Credits
    const cast = tmdbData?.credits?.cast?.slice(0, 15) || [];
    const crew = tmdbData?.credits?.crew || [];
    const directors = crew.filter(c => c.job === 'Director' || c.job === 'Series Director');
    const producers = crew.filter(c => c.job === 'Producer' || c.job === 'Executive Producer');


    // 5. User Data
    const reviews = localMovie ? await getReviewsByMovieId(localMovie.id) : [];
    const session = await auth();
    const userId = session?.user ? (session.user as { id: string }).id : null;
    const existingReview = (userId && localMovie) ? await getReviewByUserAndMovie(userId, localMovie.id) : null;
    const isSaved = (userId && localMovie) ? await isInWatchlist(userId, localMovie.id) : false;

    const ratingCounts = { disaster: 0, timepass: 0, go_for_it: 0, perfection: 0 };
    for (const r of reviews) ratingCounts[r.meter_rating as keyof typeof ratingCounts]++;

    return (
        <div className="min-h-screen bg-black overflow-x-hidden">
            {/* ──── HERO SECTION ──────────────────────── */}
            <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center">
                {(m.backdrop_url || m.poster_url) ? (
                    <Image
                        src={m.backdrop_url || m.poster_url!}
                        alt={m.title}
                        fill
                        className="object-cover object-top opacity-30 grayscale-[0.5] mix-blend-luminosity scale-105"
                        sizes="100vw"
                        priority
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-950" />
                )}
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/90" />

                {/* Abstract overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 -mt-80 md:-mt-96 relative z-10">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

                    {/* ──── LEFT: POSTER & ACTIONS ────────── */}
                    <div className="flex-shrink-0 animate-fade-up flex flex-col items-center md:items-start" style={{ animationDelay: '100ms' }}>
                        <SharedPoster
                            id={localMovie ? localMovie.id : id}
                            title={m.title}
                            posterUrl={m.poster_url}
                            isLocal={!!localMovie}
                        />

                        {/* Watchlist Action */}
                        <div className="mt-8 w-full md:w-80 flex justify-center">
                            {userId && localMovie ? (
                                <WatchlistToggle movieId={localMovie.id} initialSaved={isSaved} />
                            ) : (
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] text-center border border-white/10 py-3 px-6 rounded-full">
                                    Authenticate to track title
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ──── RIGHT: INFO & METERS ──────────── */}
                    <div className="flex-1 pt-6 md:pt-16 animate-fade-up">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black mix-blend-screen rounded-full">
                                {m.type === 'series' ? 'SERIES' : 'FILM'}
                            </span>
                            {m.release_year && (
                                <span className="text-sm font-bold text-white tracking-widest">{m.release_year}</span>
                            )}
                            {runtime && (
                                <>
                                    <div className="h-4 w-px bg-white/20 mx-1" />
                                    <span className="text-sm font-bold text-white/70 tracking-widest">{runtime} MIN</span>
                                </>
                            )}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-2">
                            {m.title}
                        </h1>
                        {m.original_title && m.original_title !== m.title && (
                            <p className="text-white/40 text-xl md:text-2xl font-bold tracking-tight mb-8">{m.original_title}</p>
                        )}

                        {/* Sleek Genre Meter Tag List */}
                        {genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-10">
                                {genres.map((g: string) => (
                                    <span key={g} className="px-4 py-1.5 text-xs font-black tracking-[0.2em] uppercase text-white border border-white/20 rounded-full shadow-[0_0_15px_-5px_rgba(255,255,255,0.2)] bg-white/5 backdrop-blur-md">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {m.overview && (
                            <div className="relative mb-12">
                                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
                                    {m.overview}
                                </p>
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/40 to-transparent -ml-6 hidden md:block" />
                            </div>
                        )}

                        {/* Global Verdict / Review Summary */}
                        {reviews.length > 0 && (
                            <div className="mt-12 p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <p className="text-xs text-white/50 uppercase font-bold tracking-[0.3em] mb-6 flex items-center gap-4">
                                    <span className="w-8 h-px bg-white/20" />
                                    Community Verdict
                                    <span className="w-8 h-px bg-white/20" />
                                </p>
                                <div className="flex flex-wrap gap-6 items-center">
                                    {(Object.entries(ratingCounts) as [string, number][])
                                        .filter(([, count]) => count > 0)
                                        .map(([rating, count]) => (
                                            <div key={rating} className="flex items-center gap-3">
                                                <MeterBadge rating={rating as MeterRatingValue} />
                                                <span className="text-lg font-black text-white">×{count}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-24" />

                {/* ──── CREDITS CAROUSEL & CREW ─────────── */}
                <section className="mb-24">
                    <div className="flex flex-col gap-1 mb-10">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">The Cast</h2>
                    </div>
                    {cast.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
                            {cast.map((actor, idx) => (
                                <Link href={`/person/${actor.id}`} key={idx} className="flex-shrink-0 w-32 sm:w-40 snap-start group cursor-pointer block">
                                    <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 mb-4 relative shadow-lg">
                                        {actor.profile_path ? (
                                            <Image
                                                src={img(actor.profile_path)!}
                                                alt={actor.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3]"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs text-white/20 uppercase font-black">{actor.name[0]}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                    <p className="text-sm font-bold text-white leading-tight uppercase tracking-wider">{actor.name}</p>
                                    <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest mt-1 line-clamp-2">{actor.character}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-white/30 uppercase tracking-[0.2em]">No cast databanks available.</p>
                    )}

                    {/* Directors & Producers */}
                    {(directors.length > 0 || producers.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16 p-8 md:p-12 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-white/[0.04] transition-colors duration-500">
                            {directors.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mb-4">Directed By</p>
                                    <div className="flex flex-col gap-2">
                                        {directors.map(d => (
                                            <span key={d.id} className="text-lg font-bold text-white tracking-wider uppercase">{d.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {producers.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mb-4">Produced By</p>
                                    <div className="flex flex-col gap-2">
                                        {producers.slice(0, 4).map(p => (
                                            <span key={p.id} className="text-lg font-bold text-white tracking-wider uppercase">{p.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <div className="w-full h-px bg-white/10 my-24" />

                {/* ──── REVIEWS & FORM ──────────────────── */}
                <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 pb-32 max-w-7xl mx-auto">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-4">
                            Logs
                            <span className="text-xs text-white/30 tracking-widest bg-white/10 px-3 py-1 rounded-full">{reviews.length}</span>
                        </h2>

                        {reviews.length === 0 ? (
                            <div className="p-16 text-center border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                <p className="text-xl font-bold text-white/30 uppercase tracking-widest">No Transmissions</p>
                                <p className="text-xs text-white/20 uppercase tracking-[0.2em] mt-4">Be the first to leave a mark.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map(review => (
                                    <article key={review.id} className="p-8 border border-white/10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.5)] group">
                                        <div className="flex items-start justify-between gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black bg-gradient-to-br from-white to-white/70 text-black shadow-lg">
                                                    {review.user_name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black tracking-[0.2em] uppercase text-white/90 group-hover:text-white transition-colors">{review.user_name}</p>
                                                    <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] mt-1">
                                                        {new Date(review.created_at).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <MeterBadge rating={review.meter_rating as MeterRatingValue} />
                                        </div>
                                        {review.body && (
                                            <p className="text-white/70 text-sm leading-relaxed border-l-2 border-white/20 pl-6 py-2 italic font-medium">"{review.body}"</p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-[600px] lg:sticky lg:top-32 self-start animate-fade-in p-8 md:p-12 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
                        <ReviewForm
                            movieId={localMovie?.id}
                            tmdbId={tmdbData?.id}
                            type={mediaType as 'movie' | 'series'}
                            session={session as { user: { id: string; name?: string | null } } | null}
                            existingReview={(existingReview as import('@/lib/db').ReviewWithUser | null) || null}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
