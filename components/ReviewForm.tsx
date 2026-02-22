'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { ReviewWithUser } from '@/lib/db';
import { MeterRating, type MeterRatingValue } from '@/components/MeterRating';

interface ReviewFormProps {
    movieId?: number;
    tmdbId?: number;
    type?: 'movie' | 'series';
    session: { user: { id: string; name?: string | null } } | null;
    existingReview?: ReviewWithUser | null;
}

export function ReviewForm({ movieId, tmdbId, type, session, existingReview }: ReviewFormProps) {
    const router = useRouter();
    const [rating, setRating] = useState<MeterRatingValue | null>(
        (existingReview?.meter_rating as MeterRatingValue) || null
    );
    const [body, setBody] = useState(existingReview?.body || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!session) {
        return (
            <div className="border border-white/20 p-8 text-center bg-white/5">
                <p className="text-sm font-bold tracking-widest uppercase text-white mb-6">
                    Authentication Required for Transmission
                </p>
                <div className="flex flex-col gap-4">
                    <a href="/login"
                        className="px-6 py-3 border border-white bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-300 transition-colors">
                        Authenticate
                    </a>
                    <a href="/register"
                        className="px-6 py-3 border border-white/20 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white transition-colors">
                        Request Clearance
                    </a>
                </div>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!rating) { setError('Please select a rating tier.'); return; }
        setLoading(true); setError(''); setSuccess('');

        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, tmdbId, type, meterRating: rating, body }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) { setError(data.error || 'Submission failed.'); return; }
        setSuccess('Review submitted successfully.');
        router.refresh();
    }

    return (
        <div className="border-l-4 border-white pl-6 md:pl-8">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                {existingReview ? 'Update Review' : 'Leave a Review'}
            </h3>
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.3em] mb-8">
                Operative <span className="text-white">{session.user.name}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="md:-mx-4">
                    <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase block mb-2 md:px-4">
                        Your Rating *
                    </label>
                    <MeterRating value={rating} onChange={setRating} />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase block mb-4">
                        Your Review (Optional)
                    </label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl text-white p-5 min-h-[140px] resize-y focus:outline-none focus:border-white/30 focus:bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 uppercase tracking-wide text-sm placeholder:text-white/20"
                        placeholder="WRITE YOUR THOUGHTS..."
                        maxLength={1000}
                    />
                    <div className="text-right text-[10px] text-white/40 mt-3 font-mono">{body.length}/1000 MAX</div>
                </div>

                {error && <p className="text-red-500 font-bold text-xs uppercase tracking-widest">{error}</p>}
                {success && <p className="text-green-400 font-bold text-xs uppercase tracking-widest">{success}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-full bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-neutral-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                    {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
}
