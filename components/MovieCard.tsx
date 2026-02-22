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

const AbstractPlaceholder = ({ title }: { title: string }) => (
    <div className="relative w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center border border-white/10 overflow-hidden">
        {/* 3D Abstract Geometric Background Grid */}
        <div className="absolute inset-0 opacity-30"
            style={{
                backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                transformOrigin: 'top center',
            }}
        />
        {/* Stark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <span className="relative z-10 text-xl font-black text-white uppercase tracking-[0.3em] leading-[1.1] mix-blend-difference">{title}</span>
    </div>
);

export function TmdbCard({ id, title, posterPath, year, voteAverage, mediaType, isLocal, localId, customBadge, genres, overview }: TmdbCardProps) {
    const imgSrc = posterPath
        ? (posterPath.startsWith('http') || posterPath.startsWith('/images')
            ? posterPath
            : `https://image.tmdb.org/t/p/w500${posterPath.startsWith('/') ? posterPath : `/${posterPath}`}`)
        : null;

    // Use localId if available, otherwise route to the dynamic page with TMDB ID and type
    const mType = mediaType === 'tv' || mediaType === 'series' ? 'series' : 'movie';
    const href = isLocal && localId ? `/movies/${localId}` : `/movies/${id}?type=${mType}`;
    const score = voteAverage ? (voteAverage / 2).toFixed(1) : null;

    const [glowColor, setGlowColor] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (!glowColor && imgSrc) {
            const fac = new FastAverageColor();
            fac.getColorAsync(imgSrc, { crossOrigin: 'anonymous' })
                .then(color => {
                    // Extract rgb array and create a low-opacity rgba syntax for the glow
                    const [r, g, b] = color.value;
                    setGlowColor(`rgba(${r}, ${g}, ${b}, 0.3)`);
                })
                .catch(() => {
                    // Silently ignore color extraction errors (e.g., CORS or missing images)
                    // so we don't trigger the Next.js dev error overlay
                });
        }
    };

    const inner = (
        <div
            className="group relative overflow-visible transform-gpu cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                layoutId={`poster-${id}`}
                animate={{
                    boxShadow: isHovered && glowColor ? `0 20px 40px -10px ${glowColor}` : '0 10px 30px -10px rgba(0,0,0,0.5)'
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[2/3] overflow-hidden bg-neutral-900 rounded-xl transition-all duration-500 ease-out group-hover:-translate-y-2 border border-white/10 group-hover:border-white/20"
            >
                {/* Poster */}
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        unoptimized
                    />
                ) : (
                    <AbstractPlaceholder title={title} />
                )}

                {/* Dark gradient overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-0" />

                {/* Media type pill */}
                {mediaType && (
                    <div className="absolute top-3 left-3 z-10 transition-transform duration-500">
                        <div className="relative overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 px-2.5 py-1 rounded-full shadow-sm group/badge hover:bg-white/20 transition-colors">
                            <span className="relative z-10 text-[9px] font-semibold uppercase tracking-widest text-white">
                                {customBadge || (mediaType === 'tv' || mediaType === 'series' ? 'Series' : 'Film')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Hover info text layout inside card */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col justify-end">
                    {score && (
                        <div className="inline-flex mb-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase border border-white/30 px-2 py-0.5 rounded-sm bg-black/40 backdrop-blur-md text-white/90">
                                {score} / 5.0
                            </span>
                        </div>
                    )}
                    <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight leading-snug mb-1.5 drop-shadow-md">
                        {title}
                    </h3>

                    {genres && genres.length > 0 && (
                        <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1.5">
                            {genres.slice(0, 3).join(', ')}
                        </p>
                    )}
                    {overview && (
                        <p className="text-xs text-white/70 tracking-wide font-normal line-clamp-2 md:line-clamp-3 mb-3 leading-relaxed">
                            {overview}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-1">
                        {year ? <span className="text-white/60 text-[10px] font-medium tracking-wider">{year}</span> : <span />}
                        <span className="text-white/90 font-semibold text-[10px] tracking-widest uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all delay-100 duration-500">
                            Details →
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return <Link href={href}>{inner}</Link>;
}

// Re-export for backward compat with existing movie listing pages
import { MeterBadge, type MeterRatingValue } from './MeterRating';

type LocalMovie = {
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
};

function getModeRating(ratings: string | null | undefined): MeterRatingValue | null {
    if (!ratings) return null;
    const arr = ratings.split(',');
    const counts: Record<string, number> = {};
    for (const r of arr) counts[r] = (counts[r] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as MeterRatingValue || null;
}

export function MovieCard({ movie, index = 0 }: { movie: LocalMovie; index?: number }) {
    const modeRating = getModeRating(movie.ratings);

    let genres: string[] = [];
    if (movie.genres) {
        try {
            const parsed = JSON.parse(movie.genres);
            genres = Array.isArray(parsed) ? parsed : [movie.genres];
        } catch { genres = [movie.genres]; }
    }

    const [glowColor, setGlowColor] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (!glowColor && movie.poster_url) {
            const fac = new FastAverageColor();
            fac.getColorAsync(movie.poster_url, { crossOrigin: 'anonymous' })
                .then(color => {
                    const [r, g, b] = color.value;
                    setGlowColor(`rgba(${r}, ${g}, ${b}, 0.3)`);
                })
                .catch(() => {
                    // Silently ignore color extraction errors
                });
        }
    };

    return (
        <Link href={`/movies/${movie.id}`}>
            <div
                className="group relative overflow-visible transform-gpu cursor-pointer animate-fade-up"
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
            >
                <motion.div
                    layoutId={`local-poster-${movie.id}`}
                    animate={{
                        boxShadow: isHovered && glowColor ? `0 20px 40px -10px ${glowColor}` : '0 10px 30px -10px rgba(0,0,0,0.5)'
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative aspect-[2/3] overflow-hidden bg-neutral-900 rounded-xl transition-all duration-500 ease-out group-hover:-translate-y-2 border border-white/10 group-hover:border-white/20"
                >
                    {movie.poster_url ? (
                        <Image
                            src={movie.poster_url.startsWith('http') || movie.poster_url.startsWith('/images')
                                ? movie.poster_url
                                : `https://image.tmdb.org/t/p/w500${movie.poster_url.startsWith('/') ? movie.poster_url : `/${movie.poster_url}`}`}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                            unoptimized
                        />
                    ) : (
                        <AbstractPlaceholder title={movie.title} />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-0" />

                    {modeRating && (
                        <div className="absolute top-3 right-3 z-10 transition-transform duration-500 group-hover:scale-105">
                            <span className="text-[10px] font-bold tracking-widest uppercase border border-white/30 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-sm shadow-md">
                                {modeRating}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-3 left-3 z-10 transition-transform duration-500">
                        <div className="relative overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 px-2.5 py-1 rounded-full shadow-sm group/badge hover:bg-white/20 transition-colors">
                            <span className="relative z-10 text-[9px] font-semibold uppercase tracking-widest text-white">
                                {movie.type === 'series' ? 'Series' : 'Film'}
                            </span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col justify-end">
                        <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight leading-snug mb-1.5 drop-shadow-md">
                            {movie.title}
                        </h3>

                        {genres.length > 0 && (
                            <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1.5">
                                {genres.slice(0, 3).join(', ')}
                            </p>
                        )}
                        {movie.overview && (
                            <p className="text-xs text-white/70 tracking-wide font-normal line-clamp-2 md:line-clamp-3 mb-3 leading-relaxed">
                                {movie.overview}
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-1">
                            {movie.release_year ? <span className="text-white/60 text-[10px] font-medium tracking-wider">{movie.release_year}</span> : <span />}
                            <span className="text-white/90 font-semibold text-[10px] tracking-widest uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all delay-100 duration-500">
                                Details →
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Link>
    );
}
