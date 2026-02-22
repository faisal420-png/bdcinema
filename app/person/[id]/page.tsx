import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTmdbPerson, getTmdbPersonCredits, img, backdrop } from '@/lib/tmdb';
import { TmdbCard } from '@/components/MovieCard';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function PersonDetailPage({ params }: Props) {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) notFound();

    let person;
    let credits;
    try {
        person = await getTmdbPerson(id);
        credits = await getTmdbPersonCredits(id);
    } catch {
        return notFound();
    }

    // Sort credits by popularity
    const castCredits = credits.cast.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    // Get a backdrop from their most popular movie
    const topBackdrop = castCredits.find(c => c.backdrop_path)?.backdrop_path || null;

    return (
        <div className="min-h-screen bg-black overflow-x-hidden">
            {/* ──── HERO SECTION ──────────────────────── */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden flex items-center justify-center">
                {topBackdrop ? (
                    <Image
                        src={backdrop(topBackdrop)!}
                        alt="Backdrop"
                        fill
                        className="object-cover object-top opacity-20 grayscale-[0.7] mix-blend-luminosity scale-105"
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
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 -mt-64 relative z-10">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

                    {/* LEFT: PROFILE PHOTO */}
                    <div className="flex-shrink-0 animate-fade-up flex flex-col items-center md:items-start" style={{ animationDelay: '100ms' }}>
                        <div className="w-56 md:w-80 rounded-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(255,255,255,0.15)] ring-1 ring-white/10 perspective-[1000px] bg-black">
                            {person.profile_path ? (
                                <Image
                                    src={img(person.profile_path, 'h632')!}
                                    alt={`${person.name} profile`}
                                    width={320}
                                    height={480}
                                    className="w-full h-auto transition-transform duration-1000 ease-cinematic hover:scale-105 grayscale-[0.2] contrast-[1.1]"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-neutral-900 border border-white/5 flex items-center justify-center p-8 text-center">
                                    <span className="text-4xl font-black text-white/20 uppercase tracking-[0.3em] leading-tight">{person.name[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: BIO */}
                    <div className="flex-1 pt-6 md:pt-16 animate-fade-up">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-2">
                            {person.name}
                        </h1>
                        <p className="text-white/40 text-xl font-bold tracking-widest uppercase mb-8">
                            {person.known_for_department}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8">
                            {person.birthday && (
                                <div className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 mb-1">Born</p>
                                    <p className="text-sm font-bold text-white tracking-widest">{person.birthday}</p>
                                </div>
                            )}
                            {person.place_of_birth && (
                                <div className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 mb-1">Birthplace</p>
                                    <p className="text-sm font-bold text-white tracking-widest">{person.place_of_birth}</p>
                                </div>
                            )}
                        </div>

                        {person.biography && (
                            <div className="relative mb-12">
                                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-4xl font-medium whitespace-pre-wrap">
                                    {person.biography.length > 1000 ? `${person.biography.substring(0, 1000)}...` : person.biography}
                                </p>
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/40 to-transparent -ml-6 hidden md:block" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-24" />

                {/* ──── FILMOGRAPHY GRID ──────────────────── */}
                <section className="pb-32">
                    <div className="flex flex-col gap-1 mb-10">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Filmography</h2>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">{castCredits.length} Credits</p>
                    </div>

                    {castCredits.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-12">
                            {castCredits.map((c, index) => (
                                <TmdbCard
                                    key={c.credit_id || `${c.media_type}-${c.id}-${index}`}
                                    id={c.id}
                                    title={c.title || c.name || 'Unknown'}
                                    posterPath={c.poster_path}
                                    year={c.release_date ? c.release_date.split('-')[0] : c.first_air_date ? c.first_air_date.split('-')[0] : undefined}
                                    mediaType={c.media_type as 'movie' | 'tv'}
                                    isLocal={false} // Assume TMDB global link behavior for simplicity here
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-white/30 uppercase tracking-[0.2em]">No transmitted media found.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
