'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { TmdbResult } from '@/lib/tmdb';
import { MagneticButton } from './MagneticButton';

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

            {/* Content & Top Bar */}
            <div className="absolute inset-0 z-10">
                {/* Mobile Top App Bar (Hidden on Desktop, as Desktop has Navbar) */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-4 pb-2 md:hidden bg-gradient-to-b from-black/80 to-transparent z-20">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amethyst to-amethyst-dark flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xs">B</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/search" className="text-white">
                            <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </Link>
                        <Link href="/profile" className="text-white">
                            <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </Link>
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-32 md:pb-32 flex justify-center md:justify-start">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="max-w-2xl w-full flex flex-col items-center text-center md:items-start md:text-left origin-bottom-center md:origin-bottom-left"
                        >
                            {/* Title */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-[0.95] tracking-tight mb-2 drop-shadow-xl text-balance">
                                {title}
                            </h1>

                            {/* Metadata / Genres */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                {year && <span className="text-sm font-bold text-white drop-shadow-md">{year}</span>}
                                {genres.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
                                {genres.map((g, idx) => (
                                    <div key={g} className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white/90 drop-shadow-md">{g}</span>
                                        {idx < genres.length - 1 && <span className="w-1 h-1 rounded-full bg-white/30" />}
                                    </div>
                                ))}
                            </div>

                            {/* Overview (Hidden on small mobile screens to keep it clean like inspiration, visible on md+) */}
                            {overview && (
                                <p className="hidden md:block text-sm text-white/70 leading-relaxed max-w-lg line-clamp-2 mb-8 font-medium">
                                    {overview}
                                </p>
                            )}

                            {/* CTAs */}
                            <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                                <Link href={href} className="flex-1 md:flex-none max-w-[200px] md:max-w-none bg-rose hover:bg-rose-dark active:scale-95 text-white rounded-full px-6 py-3.5 md:py-3 text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(244,63,94,0.4)] md:bg-white/10 md:hover:bg-white/20 md:backdrop-blur-md md:shadow-none">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    Play Trailer
                                </Link>
                                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 active:scale-95 transition-transform md:hidden">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Indicator Pills */}
            <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
