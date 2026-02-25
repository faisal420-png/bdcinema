'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function WatchedToggle({ movieId, initialWatched = false }: { movieId: number; initialWatched?: boolean }) {
    const [watched, setWatched] = useState(initialWatched);
    const [loading, setLoading] = useState(false);

    const toggle = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/watched', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieId }),
            });
            const data = await res.json();
            setWatched(data.watched);
        } catch (e) {
            console.error('Failed to toggle watched', e);
        }
        setLoading(false);
    };

    return (
        <motion.button
            onClick={toggle}
            disabled={loading}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`glass-btn rounded-full px-5 py-2.5 text-xs font-bold tracking-wider uppercase inline-flex items-center gap-2 transition-all duration-500 ${watched
                    ? 'bg-amethyst/25 border-amethyst/50 text-amethyst-light shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                    : 'text-white/60 hover:text-white'
                } ${loading ? 'opacity-50' : ''}`}
        >
            {watched ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
            {watched ? 'Watched' : 'Mark Watched'}
        </motion.button>
    );
}
