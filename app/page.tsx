import Image from 'next/image';
import Link from 'next/link';
import { getAllMovies } from '@/lib/db';
import { trendingGlobal, popularMovies, popularSeries, fetchBangladeshiMovies, fetchIndianMovies, fetchIndianSeries, getGenres, type TmdbResult } from '@/lib/tmdb';
import { TmdbCard, MovieCard } from '@/components/MovieCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Carousel } from '@/components/Carousel';

export const dynamic = 'force-dynamic';

function TmdbCarouselCard({ item, typeLabel, genreMap }: { item: TmdbResult; typeLabel?: string; genreMap?: Record<number, string> }) {
    const title = item.title || item.name || 'Unknown';
    const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || null;
    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const genres = genreMap && item.genre_ids ? item.genre_ids.map(id => genreMap[id]).filter(Boolean) as string[] : [];
    return (
        <div className="flex-shrink-0 w-[200px] sm:w-[240px] snap-start relative">
            <TmdbCard
                id={item.id}
                title={title}
                posterPath={item.poster_path}
                year={year}
                voteAverage={item.vote_average}
                mediaType={mediaType}
                customBadge={typeLabel}
                genres={genres}
                overview={item.overview || undefined}
            />
        </div>
    );
}

export default async function HomePage() {
    const [localMovies, trending, popular, series, bdMovies, inMovies, inSeries, mGenres, tGenres] = await Promise.all([
        getAllMovies(),
        trendingGlobal().catch(() => [] as TmdbResult[]),
        popularMovies().catch(() => [] as TmdbResult[]),
        popularSeries().catch(() => [] as TmdbResult[]),
        fetchBangladeshiMovies().catch(() => [] as TmdbResult[]),
        fetchIndianMovies().catch(() => [] as TmdbResult[]),
        fetchIndianSeries().catch(() => [] as TmdbResult[]),
        getGenres('movie').catch(() => ({}) as Record<number, string>),
        getGenres('tv').catch(() => ({}) as Record<number, string>),
    ]);

    const genreMap = { ...tGenres, ...mGenres };

    // Slicing global popular movies by known genre IDs for categorized rows
    const actionMovies = popular.filter(m => m.genre_ids?.includes(28));
    const scifiFantasy = popular.filter(m => m.genre_ids?.includes(878) || m.genre_ids?.includes(14));
    const dramaMovies = popular.filter(m => m.genre_ids?.includes(18));

    return (
        <div className="min-h-screen bg-black">
            <HeroCarousel items={trending.slice(0, 6)} genreMap={genreMap} />

            <div className="w-full relative z-10 -mt-24 pt-24 pb-32">

                {/* ──── TRENDING NOW ───────────────── */}
                {trending.length > 0 && (
                    <Carousel title="Trending" subtitle="The World Is Watching">
                        {trending.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={item} typeLabel={item.media_type === 'tv' ? 'Series' : 'Film'} genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {/* ──── SPOTLIGHT ON BANGLADESH ─────────── */}
                {localMovies.length > 0 && (
                    <section className="mb-24 max-w-7xl mx-auto px-6 sm:px-10">
                        <div className="flex flex-col gap-1 mb-10">
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">Bangladesh</h2>
                            <span className="text-xs text-white/50 tracking-widest uppercase font-medium">Local Masterpieces</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {localMovies.map((movie, i) => (
                                <MovieCard key={movie.id} movie={movie} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ──── GENRE SPOTLIGHTS ──────────────────── */}
                {actionMovies.length > 0 && (
                    <Carousel title="High-Octane" subtitle="Pure Adrenaline Action">
                        {actionMovies.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={{ ...item, media_type: 'movie' }} genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {/* ──── INDIAN CINEMA REGIONAL SPOTLIGHT ──── */}
                {inMovies.length > 0 && (
                    <Carousel title="India" subtitle="Subcontinental Blockbusters">
                        {inMovies.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={{ ...item, media_type: 'movie' }} typeLabel="Bollywood / South" genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {scifiFantasy.length > 0 && (
                    <Carousel title="Sci-Fi & Fantasy" subtitle="Beyond Imagination">
                        {scifiFantasy.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={{ ...item, media_type: 'movie' }} genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {/* ──── GLOBAL SERIES ──────────────────── */}
                {series.length > 0 && (
                    <Carousel title="Bingeworthy" subtitle="Critically Acclaimed Series">
                        {series.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={{ ...item, media_type: 'tv' }} typeLabel="Series" genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {dramaMovies.length > 0 && (
                    <Carousel title="Masterpieces" subtitle="Dramatic Storytelling">
                        {dramaMovies.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={{ ...item, media_type: 'movie' }} genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {inSeries.length > 0 && (
                    <Carousel title="Indian TV" subtitle="Viral Regional Series">
                        {inSeries.slice(0, 20).map(item => (
                            <TmdbCarouselCard key={item.id} item={{ ...item, media_type: 'tv' }} typeLabel="Series" genreMap={genreMap} />
                        ))}
                    </Carousel>
                )}

                {/* ──── THE METER (LIQUID GLASS) ──────────── */}
                <section className="mb-32 mt-16 max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="relative rounded-3xl border border-white/10 p-10 sm:p-16 bg-white/[0.02] backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row gap-16 items-center overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="lg:w-1/3 relative z-10">
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-md">The Meter</h2>
                            <p className="text-sm text-white/60 tracking-wider leading-relaxed font-normal">
                                Our brutally honest rating system. No stars. No scores. Pure, unadulterated judgment.
                            </p>
                        </div>
                        <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative z-10">
                            {[
                                { label: 'DISASTER', style: 'border-red-500/50 text-red-500 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)] hover:bg-red-500/10', textStyle: 'text-white/40 group-hover:text-red-100/70', desc: 'Absolute garbage. Run.' },
                                { label: 'TIMEPASS', style: 'border-orange-500/50 text-orange-500 hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] hover:bg-orange-500/10', textStyle: 'text-white/50 group-hover:text-orange-100/70', desc: 'Meh. If you\'re bored.' },
                                { label: 'GO FOR IT', style: 'border-blue-400/50 text-blue-400 hover:shadow-[0_0_20px_-5px_rgba(96,165,250,0.4)] hover:bg-blue-400/10', textStyle: 'text-white/70 group-hover:text-blue-100/80', desc: 'Solid pick. Clear schedule.' },
                                { label: 'PERFECTION', style: 'border-green-400/50 text-green-400 hover:shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)] hover:bg-green-400/10', textStyle: 'text-white/90 group-hover:text-green-100/90', desc: 'Masterpiece. Required.' },
                            ].map(t => (
                                <div key={t.label} className={`group rounded-2xl border p-6 transition-all duration-500 cursor-default bg-black/20 backdrop-blur-md ${t.style}`}>
                                    <p className="text-sm font-black tracking-[0.2em] mb-3">{t.label}</p>
                                    <p className={`text-xs font-medium tracking-wide leading-relaxed transition-colors duration-500 ${t.textStyle}`}>
                                        {t.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
