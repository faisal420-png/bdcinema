'use client';

import { motion } from 'framer-motion';

type Review = {
    id: number;
    movie_id: number;
    user_id: number;
    meter_rating: 'disaster' | 'timepass' | 'go_for_it' | 'perfection';
    body: string | null;
    created_at: string;
};

type Movie = {
    id: number;
    tmdb_id: number | null;
    title: string;
    original_title: string | null;
    overview: string | null;
    release_year: number | null;
    poster_url: string | null;
    backdrop_url: string | null;
    type: 'movie' | 'series';
    source: 'tmdb' | 'custom';
    genres: string;
    created_at: string;
};

type ReviewWithMovie = Review & { movie: Movie };

type ProfileProps = {
    user: { name: string; email: string; created_at?: string };
    reviews: ReviewWithMovie[];
    children?: React.ReactNode;
};

const getRankInfo = (cred: number) => {
    if (cred < 500) return { name: 'Casual Viewer', color: 'from-neutral-500 to-gray-300', glow: 'shadow-white/20' };
    if (cred < 1500) return { name: 'Certified Critic', color: 'from-neon-cyan to-blue-500', glow: 'shadow-neon-cyan/40' };
    if (cred < 5000) return { name: 'Cinema Snob', color: 'from-purple-500 to-neon-pink', glow: 'shadow-neon-pink/40' };
    return { name: 'Auteur', color: 'from-green-400 to-neon-green', glow: 'shadow-neon-green/50' };
};

const getMostGivenRating = (reviews: ReviewWithMovie[]) => {
    if (reviews.length === 0) return 'NONE';
    const counts: Record<string, number> = {};
    let max = 0;
    let mostGiven = 'NONE';
    reviews.forEach(r => {
        counts[r.meter_rating] = (counts[r.meter_rating] || 0) + 1;
        if (counts[r.meter_rating] > max) {
            max = counts[r.meter_rating];
            mostGiven = r.meter_rating;
        }
    });
    return mostGiven.replace(/_/g, ' ').toUpperCase();
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
};

const ratingColors: Record<string, string> = {
    disaster: 'text-red-500 bg-red-500/20 border-red-500/50',
    timepass: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50',
    go_for_it: 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/50',
    perfection: 'text-neon-pink bg-neon-pink/20 border-neon-pink/50',
};

export default function ProfileClient({ user, reviews, children }: ProfileProps) {
    const cred = reviews.length * 100;
    const rank = getRankInfo(cred);
    const mostGivenRating = getMostGivenRating(reviews);

    const memberSince = user.created_at ? new Date(user.created_at).getFullYear() : '2024';
    const displayName = user.name || user.email?.split('@')[0] || 'Unknown';

    return (
        <div className="min-h-screen bg-black pt-28 pb-16 relative overflow-hidden">
            {/* Ambient Background Glow based on Rank */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-10 bg-gradient-to-r ${rank.color} pointer-events-none`} />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16 relative group"
                >
                    {/* Glowing Core Background entirely based on rank */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${rank.color} blur-[120px] opacity-[0.15] rounded-[3rem] -z-10 transition-all duration-1000 group-hover:opacity-[0.25]`} />

                    <div className="bg-[#050505]/80 backdrop-blur-[80px] shadow-2xl border border-white/[0.08] rounded-[2.5rem] p-8 sm:p-12 overflow-hidden relative flex flex-col gap-10">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 pointer-events-none" />

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10 w-full">
                            {/* Left: User Avatar & Intro */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8 w-full lg:w-auto">
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${rank.color} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700 animate-pulse`} />
                                    <div className="relative w-32 h-32 rounded-[2rem] bg-black border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 transition-transform duration-500 group-hover:scale-[1.05] group-hover:rotate-3 rotate-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
                                        <span className={`text-6xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-600`}>
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 lg:flex-initial flex flex-col justify-center mt-2">
                                    <div className="flex justify-center sm:justify-start">
                                        <span className={`inline-block px-3 py-1 mb-4 rounded-md bg-white/5 border border-white/10 text-[9px] font-black tracking-[0.4em] text-white/60 uppercase shadow-inner`}>
                                            Operative Dashboard
                                        </span>
                                    </div>
                                    <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                                        {displayName}
                                    </h1>
                                </div>
                            </div>

                            {/* Right: The Critic Cred Engine */}
                            <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0">
                                <div className={`relative px-10 py-8 rounded-[2rem] bg-black border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden hover:scale-[1.02] transition-transform duration-500 w-full sm:w-auto min-w-[320px] text-center lg:text-right`}>
                                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${rank.color} transition-all duration-700`} />
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col items-center lg:items-end w-full">
                                        <div className="flex items-center gap-2 mb-2 w-full justify-center lg:justify-end">
                                            <div className={`h-2 w-2 rounded-full animate-pulse bg-gradient-to-r ${rank.color} shadow-[0_0_10px_currentColor]`}></div>
                                            <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.4em]">Engine Active</p>
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className={`text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${rank.color} drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] leading-none`}>
                                                {cred}
                                            </span>
                                            <span className="text-sm font-black text-white/30 uppercase tracking-widest translate-y-[-4px]">CRD</span>
                                        </div>
                                        <div className="flex flex-col items-center lg:items-end gap-2 w-full">
                                            <span className={`text-sm font-black uppercase tracking-[0.3em] text-white drop-shadow-md`}>
                                                {rank.name}
                                            </span>
                                            <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (cred / 5000) * 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                    className={`h-full bg-gradient-to-r ${rank.color} relative shadow-[0_0_10px_currentColor]`}
                                                >
                                                    <div className="absolute inset-0 bg-white/40 w-full animate-[shimmer_2s_infinite]" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Matrix Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-4 w-full">
                            <div className="bg-black/50 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/5 shadow-inner hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300 relative overflow-hidden group/card text-center md:text-left">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                <span className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-[#00f5ff] uppercase tracking-[0.3em] mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff]/50 shadow-[0_0_5px_currentColor]"></span> Vol. Logged
                                </span>
                                <span className="text-5xl font-black text-white tracking-tighter leading-none">{reviews.length} <span className="text-lg text-white/20 tracking-widest pl-1">TITLES</span></span>
                            </div>
                            <div className="bg-black/50 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/5 shadow-inner hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300 relative overflow-hidden group/card text-center md:text-left">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#ff2d78]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                <span className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-[#ff2d78] uppercase tracking-[0.3em] mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78]/50 shadow-[0_0_5px_currentColor]"></span> Top Rating
                                </span>
                                <span className="text-2xl font-black text-white tracking-tight leading-none truncate block mt-3">{mostGivenRating}</span>
                            </div>
                            <div className="bg-black/50 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/5 shadow-inner hover:bg-white/[0.02] hover:border-white/20 transition-all duration-300 relative overflow-hidden group/card text-center md:text-left">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#39ff14]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                <span className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-[#39ff14] uppercase tracking-[0.3em] mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14]/50 shadow-[0_0_5px_currentColor]"></span> Clearance Date
                                </span>
                                <span className="text-4xl font-black text-white tracking-tight leading-none mt-1 inline-block">{memberSince}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* My Logbook (Review History) */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">My Logbook</h2>
                        <span className="text-xs font-bold text-white/40 tracking-widest uppercase">VOL. {reviews.length}</span>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                            {reviews.map((review) => {
                                const posterUrl = review.movie.poster_url
                                    ? (review.movie.poster_url.startsWith('http') ? review.movie.poster_url : `https://image.tmdb.org/t/p/w500${review.movie.poster_url}`)
                                    : '/placeholder-poster.png'; // Assume a placeholder exists or handle gracefully

                                const badgeColor = ratingColors[review.meter_rating] || ratingColors.timepass;

                                return (
                                    <motion.div key={review.id} variants={itemVariants} className="group flex flex-col gap-3 cursor-pointer">
                                        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                                            {/* Poster Image */}
                                            {review.movie.poster_url ? (
                                                <img
                                                    src={posterUrl}
                                                    alt={review.movie.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                                    <span className="text-white/20 text-4xl mb-2">🎬</span>
                                                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                                        {review.movie.title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Top Right Meter Badge */}
                                            <div className="absolute top-3 right-3 z-20">
                                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1.5 rounded-md backdrop-blur-md shadow-lg ${badgeColor}`}>
                                                    {review.meter_rating.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            {/* Bottom Gradient Overlay purely for aesthetic */}
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </div>

                                        <div className="flex flex-col gap-1 px-1">
                                            <h3 className="text-sm font-bold text-white truncate drop-shadow-md">
                                                {review.movie.title}
                                            </h3>
                                            <p className="text-[10px] text-white/50 font-space tracking-widest uppercase">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.01]">
                            <p className="text-lg font-black text-white/30 uppercase tracking-widest">Logbook Empty</p>
                            <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">Rate movies to earn Critic Cred.</p>
                        </div>
                    )}
                </motion.section>

                {/* Render Admin Controls if provided */}
                {children && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-16 pt-16 border-t border-white/10"
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
