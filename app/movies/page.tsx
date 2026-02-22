import { getAllMovies } from '@/lib/db';
import { MovieCard } from '@/components/MovieCard';

export const dynamic = 'force-dynamic';

export default function MoviesPage() {
    const movies = getAllMovies();
    const allMovies = movies.filter(m => m.type === 'movie');
    const allSeries = movies.filter(m => m.type === 'series');

    return (
        <div className="min-h-screen bg-black pt-28 pb-16">
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                <div className="mb-16 animate-fade-up">
                    <span className="text-xs font-bold tracking-[0.4em] text-white/50 uppercase block mb-4">
                        The Master Archive
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
                        All Titles.
                    </h1>
                    <p className="text-white/60 text-sm max-w-md">
                        {movies.length} entries registered in the global cinematic database.
                    </p>
                </div>

                {allMovies.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Films</h2>
                            <span className="text-xs font-bold text-white/40 tracking-widest uppercase">VOL. {allMovies.length}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                            {allMovies.map((movie, i) => (
                                <MovieCard key={movie.id} movie={movie} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {allSeries.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Series</h2>
                            <span className="text-xs font-bold text-white/40 tracking-widest uppercase">VOL. {allSeries.length}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                            {allSeries.map((movie, i) => (
                                <MovieCard key={movie.id} movie={movie} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {movies.length === 0 && (
                    <div className="text-center py-32 border border-white/10">
                        <p className="text-2xl font-black text-white/40 uppercase tracking-widest">Archive Empty</p>
                        <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">Awaiting systemic database injection.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
