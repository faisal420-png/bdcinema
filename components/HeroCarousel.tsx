'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { TmdbResult } from '@/lib/tmdb';
import { MagneticButton } from '@/components/MagneticButton';

export function HeroCarousel({ items, genreMap }: { items: TmdbResult[], genreMap: Record<number, string> }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(nextSlide, 7000); // 7s smooth transition
        return () => clearInterval(timer);
    }, [isAutoPlaying, nextSlide]);

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false); // Stop auto-play so user retains control
    };

    if (!items || items.length === 0) return null;

    const nextItemIndex = (currentIndex + 1) % items.length;
    const nextItem = items[nextItemIndex];

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="relative h-screen min-h-[800px] w-full bg-[#050505] overflow-hidden mb-24 group"
        >
            {/* Removed mode="wait" to fix the black screen issue. Crossfade works best. */}
            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.5, ease: 'easeOut' } }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full z-10"
                >
                    {(() => {
                        const item = items[currentIndex];
                        if (!item) return null;
                        const title = item.title || item.name || 'Unknown';
                        const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || '';
                        const overview = item.overview || '';
                        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                        const backdropUrl = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null;
                        const itemGenres = (item.genre_ids || [])
                            .map(id => genreMap[id])
                            .filter(Boolean)
                            .slice(0, 3);

                        return (
                            <>
                                {/* Background Image with infinite slow Ken Burns zoom */}
                                {backdropUrl && (
                                    <motion.img
                                        initial={{ scale: 1.0 }}
                                        animate={{ scale: 1.08 }}
                                        transition={{ duration: 20, ease: "linear" }}
                                        src={backdropUrl}
                                        alt={title}
                                        className="absolute inset-0 w-full h-full object-cover will-change-transform"
                                    />
                                )}

                                {/* Vignette Gradients for Text Legibility & Blend */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 sm:via-black/40 to-black/20" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
                                <div className="absolute inset-0 bg-black/30" />

                                {/* Typography Layout */}
                                <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-8 lg:px-12 flex items-center pt-24 pb-32">
                                    <div className="max-w-3xl flex flex-col justify-end">

                                        {/* Meta Tags */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex flex-wrap items-center gap-4 mb-6"
                                        >
                                            <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-[10px] border border-white/20 text-[10px] font-bold tracking-[0.2em] text-white uppercase shadow-lg">
                                                {mediaType === 'tv' ? 'Series' : 'Film'}
                                            </span>
                                            {year && <span className="text-white/90 font-semibold tracking-widest text-sm">{year}</span>}
                                            {year && itemGenres.length > 0 && <span className="w-1 h-1 rounded-full bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.8)]" />}
                                            <div className="flex flex-wrap gap-2 text-white/80 text-sm font-medium tracking-wide">
                                                {itemGenres.join(', ')}
                                            </div>
                                        </motion.div>

                                        {/* Title */}
                                        <motion.h1
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] text-white drop-shadow-2xl mb-8"
                                        >
                                            {title}
                                        </motion.h1>

                                        {/* Divider */}
                                        <motion.div
                                            initial={{ opacity: 0, scaleX: 0 }}
                                            animate={{ opacity: 1, scaleX: 1 }}
                                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                            className="h-px w-24 bg-gradient-to-r from-neon-cyan via-white to-transparent mb-8 origin-left"
                                        />

                                        {/* Overview */}
                                        <motion.p
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            className="text-white/70 text-base md:text-lg tracking-wide leading-relaxed font-normal mb-12 line-clamp-3 max-w-2xl drop-shadow-md"
                                        >
                                            {overview}
                                        </motion.p>

                                        {/* Actions */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex flex-wrap items-center gap-6"
                                        >
                                            <MagneticButton strength={15}>
                                                <Link href={`/movies/${item.id}?type=${mediaType}`}
                                                    className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-neutral-200 transition-all duration-500 shadow-[0_10px_30px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.5)] hover:scale-105">
                                                    Read Details
                                                </Link>
                                            </MagneticButton>
                                            <MagneticButton strength={15}>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center px-10 py-4 bg-transparent border border-white/30 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/10 backdrop-blur-[20px] transition-all duration-500 shadow-xl"
                                                    onClick={() => alert('Trailer routing coming soon')}
                                                >
                                                    Watch Trailer
                                                </button>
                                            </MagneticButton>
                                        </motion.div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </motion.div>
            </AnimatePresence>

            {/* Next Up Glass Card */}
            {nextItem && (
                <div className="absolute top-1/2 -translate-y-1/2 right-12 z-30 hidden lg:flex flex-col gap-3 group/nextcursor cursor-pointer" onClick={() => handleDotClick(nextItemIndex)}>
                    <p className="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase pl-2">Up Next</p>
                    <div className="w-56 overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-[40px] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] p-2 transition-all duration-500 hover:scale-105 hover:bg-white/[0.05] hover:border-white/20">
                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3">
                            {nextItem.backdrop_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${nextItem.backdrop_path}`}
                                    alt={nextItem.title || nextItem.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover/nextcursor:scale-110 transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-neutral-900" />
                            )}
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/nextcursor:opacity-100 transition-opacity duration-300">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        </div>
                        <p className="text-white text-sm font-semibold truncate px-2 mb-1 drop-shadow-md">
                            {nextItem.title || nextItem.name}
                        </p>
                    </div>
                </div>
            )}

            {/* Pagination & Autoplay Dashboard */}
            <div className="absolute bottom-10 left-0 right-0 z-30 px-8 lg:px-12 mx-auto max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-8 w-full max-w-md">
                    {/* Active Progress Bar */}
                    <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden relative border border-white/5">
                        <AnimatePresence mode="popLayout">
                            {isAutoPlaying && (
                                <motion.div
                                    key={`progress-${currentIndex}`}
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 7, ease: 'linear' }}
                                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-neon-green via-neon-cyan to-white shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dots Fallback for control */}
                    <div className="flex gap-2">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`transition-all duration-300 rounded-full ${index === currentIndex ? 'w-4 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60 hover:scale-150'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Play/Pause Control */}
                    <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="text-white/50 hover:text-white transition-colors"
                        aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
                    >
                        {isAutoPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </motion.section>
    );
}
