'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Carousel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [children]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth * 0.7 : clientWidth * 0.7;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-16 group relative"
        >
            {/* Section Header */}
            <div className="flex items-end justify-between mb-6 px-6 sm:px-10 max-w-[1400px] mx-auto">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">{title}</h2>
                    {subtitle && <span className="text-[10px] text-white/40 tracking-widest uppercase font-medium">{subtitle}</span>}
                </div>
                {/* Arrow buttons visible on non-touch */}
                <div className="hidden sm:flex items-center gap-1.5">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`glass-btn rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                        aria-label="Scroll left"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`glass-btn rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                        aria-label="Scroll right"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="relative max-w-[1400px] mx-auto">
                {/* Left fade */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
                )}

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto pb-6 px-6 sm:px-10 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="flex gap-4 w-max">
                        {children}
                    </div>
                </div>

                {/* Right fade */}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
                )}
            </div>
        </motion.section>
    );
}
