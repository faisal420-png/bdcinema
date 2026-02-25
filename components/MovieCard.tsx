'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';

interface TmdbCardProps {
    id: number;
    title: string;
    posterPath: string | null;
    year?: string | null;
    voteAverage?: number;
    mediaType?: string;
    isLocal?: boolean;
    localId?: number;
    customBadge?: string;
    genres?: string[];
    overview?: string | null;
}

function AbstractPlaceholder({ title }: { title: string }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-200">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(139,92,246,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <span className="text-base font-display font-bold text-white/60 uppercase tracking-[0.15em] text-center px-4 relative z-10">{title}</span>
        </div>
    );
}

export function TmdbCard({ id, title, posterPath, year, voteAverage, mediaType, isLocal, localId, customBadge, genres, overview }: TmdbCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [glowColor, setGlowColor] = useState('rgba(139, 92, 246, 0.15)');
    const imgRef = useRef<HTMLImageElement>(null);

    const linkId = isLocal && localId ? localId : id;
    const linkType = mediaType || 'movie';
    const href = isLocal
        ? `/movies/${linkId}`
        : `/movies/${id}?type=${linkType === 'tv' ? 'series' : linkType}`;

    const posterUrl = posterPath
        ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`)
        : null;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (imgRef.current) {
            const fac = new FastAverageColor();
            fac.getColorAsync(imgRef.current, { algorithm: 'dominant' })
                .then(c => {
                    setGlowColor(`rgba(${c.value[0]}, ${c.value[1]}, ${c.value[2]}, 0.25)`);
                })
                .catch(() => { });
        }
    };

    return (
        <Link href={href} className="block group">
            <motion.div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
                className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                    boxShadow: isHovered
                        ? `0 20px 60px ${glowColor}, 0 0 40px ${glowColor}`
                        : '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Glass border */}
                <div className="absolute inset-0 rounded-2xl border border-white/[0.08] z-20 pointer-events-none transition-all duration-500 group-hover:border-white/[0.15]" />

                {/* Poster */}
                {posterUrl ? (
                    <Image
                        ref={imgRef as any}
                        src={posterUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                        unoptimized
                        crossOrigin="anonymous"
                    />
                ) : (
                    <AbstractPlaceholder title={title} />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between z-30">
                    {customBadge && (
                        <span className="glass-pill bg-amethyst/20 text-amethyst-light border-amethyst/30 text-[10px]">
                            {customBadge}
                        </span>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className={`absolute inset-0 z-20 transition-all duration-500 flex flex-col justify-end p-4 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="relative z-10">
                        <h3 className="text-sm font-display font-bold text-white leading-tight mb-1 line-clamp-2">{title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                            {year && <span className="text-[10px] text-white/60 font-medium">{year}</span>}
                            {voteAverage && voteAverage > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-amethyst-light" />
                                    <span className="text-[10px] text-amethyst-light font-bold">{voteAverage.toFixed(1)}</span>
                                </>
                            )}
                        </div>
                        {genres && genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {genres.slice(0, 2).map(g => (
                                    <span key={g} className="text-[8px] text-white/50 font-bold uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded-full">{g}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Re-export for backward compat with existing movie listing pages
import { MeterBadge, type MeterRatingValue } from './MeterRating';

interface LocalMovie {
    id: number;
    title: string;
    original_title?: string | null;
    release_year?: number | null;
    poster_url?: string | null;
    type: string;
    genres?: string;
    overview?: string | null;
    review_count?: number;
    ratings?: string | null;
}

function getModeRating(ratings: string | null | undefined): MeterRatingValue | null {
    if (!ratings) return null;
    const arr = ratings.split(',').filter(Boolean);
    if (arr.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const r of arr) counts[r] = (counts[r] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as MeterRatingValue;
}

export function MovieCard({ movie, index = 0 }: { movie: LocalMovie; index?: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const [glowColor, setGlowColor] = useState('rgba(139, 92, 246, 0.15)');
    const imgRef = useRef<HTMLImageElement>(null);

    const modeRating = getModeRating(movie.ratings);

    const meterColorMap: Record<string, string> = {
        disaster: 'bg-red-500/20 text-red-400 border-red-500/30',
        timepass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        go_for_it: 'bg-teal/20 text-teal-light border-teal/30',
        perfection: 'bg-amethyst/20 text-amethyst-light border-amethyst/30',
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (imgRef.current) {
            const fac = new FastAverageColor();
            fac.getColorAsync(imgRef.current, { algorithm: 'dominant' })
                .then(c => {
                    setGlowColor(`rgba(${c.value[0]}, ${c.value[1]}, ${c.value[2]}, 0.25)`);
                })
                .catch(() => { });
        }
    };

    return (
        <Link href={`/movies/${movie.id}`} className="block group">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
                className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.04 }}
                style={{
                    boxShadow: isHovered
                        ? `0 20px 60px ${glowColor}, 0 0 40px ${glowColor}`
                        : '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Glass border */}
                <div className="absolute inset-0 rounded-2xl border border-white/[0.08] z-20 pointer-events-none transition-all duration-500 group-hover:border-white/[0.15]" />

                {/* Poster */}
                {movie.poster_url ? (
                    <Image
                        ref={imgRef as any}
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                        unoptimized
                        crossOrigin="anonymous"
                    />
                ) : (
                    <AbstractPlaceholder title={movie.title} />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-30">
                    <span className="glass-pill bg-white/10 text-white/70 text-[10px]">
                        {movie.type === 'series' ? 'Series' : 'Film'}
                    </span>
                    {modeRating && (
                        <span className={`glass-pill text-[10px] ${meterColorMap[modeRating] || ''}`}>
                            {modeRating.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className={`absolute inset-0 z-20 transition-all duration-500 flex flex-col justify-end p-4 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="relative z-10">
                        <h3 className="text-sm font-display font-bold text-white leading-tight mb-1 line-clamp-2">{movie.title}</h3>
                        <div className="flex items-center gap-2">
                            {movie.release_year && <span className="text-[10px] text-white/60 font-medium">{movie.release_year}</span>}
                            {movie.review_count && movie.review_count > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-amethyst-light" />
                                    <span className="text-[10px] text-white/50 font-medium">{movie.review_count} reviews</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
