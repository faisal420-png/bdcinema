'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function WatchlistToggle({ movieId, initialSaved }: { movieId: number; initialSaved: boolean }) {
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function toggle() {
        setLoading(true);
        const res = await fetch('/api/watchlist', {
            method: 'POST',
            body: JSON.stringify({ movieId })
        });

        if (res.ok) {
            setSaved(!saved);
            router.refresh();
        } else {
            alert('Failed to update watchlist. Authentication required.');
        }
        setLoading(false);
    }

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ease-cinematic border flex items-center justify-center gap-3
                ${saved
                    ? 'bg-white text-black border-white hover:bg-neutral-200'
                    : 'bg-transparent text-white border-white/20 hover:border-white hover:bg-white/10'
                }`}
        >
            {saved ? (
                <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Tracked
                </>
            ) : (
                <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Track Title
                </>
            )}
        </button>
    );
}
