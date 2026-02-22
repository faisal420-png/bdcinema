'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SharedPosterProps {
    id: number | string;
    title: string;
    posterUrl: string | null;
    isLocal?: boolean;
}

export function SharedPoster({ id, title, posterUrl, isLocal = false }: SharedPosterProps) {
    const layoutId = isLocal ? `local-poster-${id}` : `poster-${id}`;

    return (
        <motion.div
            layoutId={layoutId}
            layout
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-56 md:w-80 rounded-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(255,255,255,0.15)] ring-1 ring-white/10 perspective-[1000px] bg-black"
        >
            {posterUrl ? (
                <Image
                    src={posterUrl}
                    alt={`${title} poster`}
                    width={320}
                    height={480}
                    className="w-full h-auto transition-transform duration-1000 ease-cinematic hover:scale-105 grayscale-[0.1] contrast-[1.1]"
                    unoptimized
                />
            ) : (
                <div className="w-full aspect-[2/3] bg-neutral-900 border border-white/5 flex items-center justify-center p-8 text-center">
                    <span className="text-2xl font-black text-white/20 uppercase tracking-[0.3em] leading-tight">{title}</span>
                </div>
            )}
        </motion.div>
    );
}
