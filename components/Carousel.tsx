'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '@/components/MagneticButton';

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
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-24 group relative"
        >
            <div className="flex flex-col gap-1.5 mb-8 px-8 sm:px-12 max-w-[1400px] mx-auto">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{title}</h2>
                {subtitle && <span className="text-[10px] text-white/50 tracking-widest uppercase font-medium">{subtitle}</span>}
            </div>

            <div className="relative max-w-[1400px] mx-auto">
                {canScrollLeft && (
                    <MagneticButton className="absolute left-0 top-0 bottom-10 z-20 flex items-center justify-start px-4 w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => scroll('left')}
                            className="bg-transparent border-none appearance-none outline-none focus:outline-none flex items-center justify-center w-full h-full"
                            aria-label="Scroll left"
                        >
                            <svg className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    </MagneticButton>
                )}

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto pb-10 px-6 sm:px-10 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="flex gap-4 w-max">
                        {children}
                    </div>
                </div>

                {canScrollRight && (
                    <MagneticButton className="absolute right-0 top-0 bottom-10 z-20 flex items-center justify-end px-4 w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => scroll('right')}
                            className="bg-transparent border-none appearance-none outline-none focus:outline-none flex items-center justify-center w-full h-full"
                            aria-label="Scroll right"
                        >
                            <svg className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </MagneticButton>
                )}
            </div>
        </motion.section>
    );
}
