'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { TmdbResult } from '@/lib/tmdb';

export function HeroCarousel({ items, genreMap }: { items: TmdbResult[], genreMap: Record<number, string> }) {
    const [current, setCurrent] = useState(0);
    const [progress, setProgress] = useState(0);

    const next = useCallback(() => {
        setCurrent(prev => (prev + 1) % items.length);
        setProgress(0);
    }, [items.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    next();
                    return 0;
                }
                return prev + 1;
            });
        }, 80);
        return () => clearInterval(timer);
    }, [next]);

    const handleDotClick = (index: number) => {
        setCurrent(index);
        setProgress(0);
    };

    if (!items.length) return null;

    const item = items[current];
    const title = item.title || item.name || 'Unknown';
    const overview = item.overview || '';
    const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || '';
    const genres = item.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 3) || [];
    const backdropUrl = item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null;
    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const href = `/movies/${item.id}?type=${mediaType === 'tv' ? 'series' : mediaType}`;

    return (
        <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
            {/* Backdrop Image with Ken Burns */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    className="absolute inset-0"
                >
                    {backdropUrl && (
                        <img
                            src={backdropUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            style={{ animation: 'kenBurns 10s ease-in-out forwards' }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-transparent to-surface/70" />
            {/* Mesh blend at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-surface to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end pb-32 z-10">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                            className="max-w-2xl"
                        >
                            {/* Genre Pills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {genres.map(g => (
                                    <span key={g} className="glass-pill bg-amethyst/15 text-amethyst-light border-amethyst/30 text-[10px]">{g}</span>
                                ))}
                                {year && <span className="glass-pill text-white/50 text-[10px]">{year}</span>}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[0.95] tracking-tight mb-4">
                                {title}
                            </h1>

                            {/* Overview */}
                            {overview && (
                                <p className="text-sm text-white/50 leading-relaxed max-w-lg line-clamp-2 mb-6 font-medium">
                                    {overview}
                                </p>
                            )}

                            {/* CTA */}
                            <div className="flex items-center gap-3">
                                <Link href={href} className="glass-btn glass-btn-primary rounded-full px-6 py-3 text-xs font-bold tracking-wider inline-flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Indicator Pills */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`relative h-1.5 rounded-full transition-all duration-500 overflow-hidden ${idx === current ? 'w-10 bg-white/20' : 'w-1.5 bg-white/20 hover:bg-white/30'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    >
                        {idx === current && (
                            <div
                                className="absolute inset-y-0 left-0 bg-amethyst rounded-full transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Ken Burns CSS */}
            <style jsx>{`
                @keyframes kenBurns {
                    0% { transform: scale(1.05) translate(0, 0); }
                    100% { transform: scale(1.12) translate(-10px, -5px); }
                }
            `}</style>
        </section>
    );
}
