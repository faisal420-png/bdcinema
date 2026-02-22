import { multiSearch } from '@/lib/tmdb';
import { TmdbCard } from '@/components/MovieCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const resolvedParams = await searchParams;
    const query = resolvedParams.q || '';

    let results: any[] = [];
    if (query) {
        results = await multiSearch(query);
    }

    // Sort logic to bring specific media types or highly rated items up.
    // For now, TMDB already returns relevance sorted by default.
    const moviesAndTv = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
    const people = results.filter(r => r.media_type === 'person');

    return (
        <div className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
            <div className="mb-12 border-b border-white/10 pb-8">
                <h1 className="text-sm font-black text-white/50 uppercase tracking-[0.4em] mb-4">Search Results</h1>
                <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter">
                    {query ? `"${query}"` : 'Enter a Query'}
                </p>
            </div>

            {query && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <p className="text-xl font-medium tracking-widest uppercase">No Matches Found in Global Database.</p>
                </div>
            )}

            {moviesAndTv.length > 0 && (
                <div className="mb-20">
                    <h2 className="text-sm font-bold tracking-[0.4em] text-white/50 uppercase mb-8">Titles</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {moviesAndTv.map(item => (
                            <div key={item.id} className="relative">
                                <TmdbCard
                                    id={item.id}
                                    title={item.title || item.name || 'Unknown'}
                                    posterPath={item.poster_path}
                                    year={item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || null}
                                    voteAverage={item.vote_average}
                                    mediaType={item.media_type || 'movie'}
                                    overview={item.overview}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {people.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold tracking-[0.4em] text-white/50 uppercase mb-8">People</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                        {people.map(person => (
                            <Link href={`/person/${person.id}`} key={person.id} className="group cursor-pointer block">
                                <div className="aspect-[2/3] w-full rounded-md overflow-hidden bg-neutral-900 border border-white/5 mb-4 relative shadow-lg group-hover:border-white/30 transition-colors">
                                    {person.profile_path ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                                            alt={person.name}
                                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                            <svg className="w-12 h-12 text-white/10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-white leading-tight uppercase tracking-wider">{person.name}</p>
                                <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest mt-1">
                                    {/* Cast known_for safely if it exists as an array of items */}
                                    {((person as any).known_for_department) || 'Actor'}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
