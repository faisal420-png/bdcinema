'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function InterestedButton({ tmdbId, mediaType = 'movie', initialInterested = false }: { tmdbId: number; mediaType?: string; initialInterested?: boolean }) {
    const [interested, setInterested] = useState(initialInterested);
    const [loading, setLoading] = useState(false);

    const toggle = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/interested', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tmdbId, mediaType }),
            });
            const data = await res.json();
            setInterested(data.interested);
        } catch (e) {
            console.error('Failed to toggle interested', e);
        }
        setLoading(false);
    };

    return (
        <motion.button
            onClick={toggle}
            disabled={loading}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`glass-btn rounded-full px-4 py-2 text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all duration-500 ${interested
                    ? 'bg-rose/20 border-rose/40 text-rose-light shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'text-white/50 hover:text-white'
                } ${loading ? 'opacity-50' : ''}`}
        >
            {interested ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            )}
            {interested ? 'Interested' : 'Interested?'}
        </motion.button>
    );
}
