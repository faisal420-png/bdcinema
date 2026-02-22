'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlitchText } from '@/components/GlitchText';
import { motion } from 'framer-motion';
import type { Movie } from '@/lib/db';

interface MovieRow extends Movie {
    review_count?: number;
}

export default function AdminClient({ hasTmdbKey }: { hasTmdbKey?: boolean }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isAdmin = (session?.user as { role?: string })?.role === 'admin';

    const [movies, setMovies] = useState<MovieRow[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState('');
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    // Add form state
    const [form, setForm] = useState({
        title: '', original_title: '', overview: '',
        release_year: '', type: 'movie', genres: '',
    });
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formMsg, setFormMsg] = useState('');

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || !isAdmin) {
            router.replace('/login');
            return;
        }
        loadMovies();
    }, [session, status]);

    async function loadMovies() {
        const res = await fetch('/api/movies');
        if (res.ok) setMovies(await res.json());
    }

    async function handleSync() {
        setSyncing(true); setSyncResult('');
        const res = await fetch('/api/tmdb/sync', { method: 'POST' });
        const data = await res.json();
        setSyncing(false);
        if (res.ok) {
            setSyncResult(`✅ Synced ${data.synced} titles (${data.movies} films · ${data.series} series)`);
            loadMovies();
        } else {
            setSyncResult(`❌ ${data.error}`);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this title and all its reviews?')) return;
        setDeleteLoading(id);
        await fetch('/api/movies', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        setDeleteLoading(null);
        loadMovies();
    }

    async function handleAddMovie(e: React.FormEvent) {
        e.preventDefault();
        setFormLoading(true); setFormMsg('');

        let posterUrl: string | null = null;

        if (posterFile) {
            const fd = new FormData();
            fd.append('file', posterFile);
            const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) { setFormMsg(`❌ Upload failed: ${uploadData.error}`); setFormLoading(false); return; }
            posterUrl = uploadData.url;
        }

        const genres = form.genres ? form.genres.split(',').map(g => g.trim()).filter(Boolean) : [];

        const res = await fetch('/api/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, genres, poster_url: posterUrl }),
        });

        const data = await res.json();
        setFormLoading(false);

        if (!res.ok) { setFormMsg(`❌ ${data.error}`); return; }
        setFormMsg(`✅ Added: ${form.title}`);
        setForm({ title: '', original_title: '', overview: '', release_year: '', type: 'movie', genres: '' });
        setPosterFile(null);
        loadMovies();
    }

    if (status === 'loading' || !isAdmin) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <p className="font-bebas text-2xl text-neutral-600 tracking-widest">Loading…</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12">
            <div className="mb-10">
                <h1 className="text-6xl text-neon-green font-bebas tracking-widest">
                    <GlitchText text="ADMIN" />
                </h1>
                <p className="text-neutral-500 font-space text-sm mt-1 uppercase tracking-widest">
                    Dashboard · {movies.length} titles in database
                </p>
            </div>

            {/* TMDB Sync Section */}
            <section className="bg-white/[0.02] backdrop-blur-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 mb-2 relative z-10">
                    <h2 className="font-bebas text-2xl tracking-widest text-neon-cyan">TMDB Sync</h2>
                    {hasTmdbKey ? (
                        <span className="px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(57,255,20,0.2)]">Connected</span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neon-red/10 text-neon-red border border-neon-red/30 text-[10px] font-bold tracking-widest uppercase">API Key Missing</span>
                    )}
                </div>
                <p className="text-xs text-neutral-400 font-space mb-4 relative z-10">
                    Fetch all Bangladeshi films & series from TMDB. Requires TMDB_API_KEY in .env.local.
                </p>
                <div className="flex items-center gap-4 flex-wrap relative z-10">
                    <button
                        id="tmdb-sync-btn"
                        onClick={handleSync}
                        disabled={syncing || !hasTmdbKey}
                        className={`btn-neon ${hasTmdbKey ? 'btn-cyan' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700'}`}
                    >
                        {syncing ? '⟳ Syncing…' : '⟳ Sync from TMDB'}
                    </button>
                    {syncResult && (
                        <p className="font-space text-sm text-neutral-300">{syncResult}</p>
                    )}
                </div>
            </section>

            {/* Add Custom Title */}
            <section className="bg-white/[0.02] backdrop-blur-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-transparent pointer-events-none" />
                <h2 className="font-bebas text-2xl tracking-widest mb-4 text-neon-pink relative z-10">Add Custom Title</h2>
                <form onSubmit={handleAddMovie}>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-space text-neutral-500 uppercase tracking-widest block mb-1">Title *</label>
                            <input id="add-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="neon-input" placeholder="e.g. Hawa" required />
                        </div>
                        <div>
                            <label className="text-xs font-space text-neutral-500 uppercase tracking-widest block mb-1">Original Title</label>
                            <input value={form.original_title} onChange={e => setForm({ ...form, original_title: e.target.value })}
                                className="neon-input" placeholder="e.g. হাওয়া" />
                        </div>
                        <div>
                            <label className="text-xs font-space text-neutral-500 uppercase tracking-widest block mb-1">Year</label>
                            <input value={form.release_year} onChange={e => setForm({ ...form, release_year: e.target.value })}
                                className="neon-input" placeholder="2024" type="number" min="1950" max="2030" />
                        </div>
                        <div>
                            <label className="text-xs font-space text-neutral-500 uppercase tracking-widest block mb-1">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="neon-input">
                                <option value="movie">Film</option>
                                <option value="series">Web Series</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-space text-neutral-500 uppercase tracking-widest block mb-1">Genres (comma separated)</label>
                            <input value={form.genres} onChange={e => setForm({ ...form, genres: e.target.value })}
                                className="neon-input" placeholder="Drama, Thriller, Crime" />
                        </div>
                        <div>
                            <label className="text-xs font-space text-neutral-500 uppercase tracking-widest block mb-1">Poster Image</label>
                            <input
                                id="poster-upload"
                                type="file"
                                accept="image/*"
                                onChange={e => setPosterFile(e.target.files?.[0] || null)}
                                className="neon-input text-xs py-2 file:mr-3 file:text-neon-cyan file:bg-transparent file:border-0 file:font-space file:text-xs file:cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="mb-4 relative z-10">
                        <label className="text-xs font-space text-neutral-400 uppercase tracking-widest block mb-1">Synopsis</label>
                        <textarea value={form.overview} onChange={e => setForm({ ...form, overview: e.target.value })}
                            className="neon-input min-h-[80px] resize-y" placeholder="Brief description of the title..." />
                    </div>
                    {formMsg && <p className="font-space text-sm mb-3 text-neutral-300 relative z-10">{formMsg}</p>}
                    <button type="submit" disabled={formLoading} className="btn-neon btn-pink relative z-10">
                        {formLoading ? 'Adding…' : '+ Add Title'}
                    </button>
                </form>
            </section>

            {/* Titles Table */}
            <section className="bg-white/[0.02] backdrop-blur-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-white/10 rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                <div className="p-6 border-b border-white/10 relative z-10">
                    <h2 className="font-bebas text-2xl tracking-widest text-white">
                        All Titles <span className="text-neutral-500">({movies.length})</span>
                    </h2>
                </div>
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                {['ID', 'Title', 'Type', 'Year', 'Source', 'Reviews', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-6 py-4 text-xs font-space text-neutral-400 uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((movie, index) => (
                                <motion.tr
                                    key={movie.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                >
                                    <td className="px-6 py-4 text-xs text-neutral-500 font-space">{movie.id}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <a href={`/movies/${movie.id}`} className="font-space text-sm text-white hover:text-neon-cyan transition-colors">
                                                {movie.title}
                                            </a>
                                            {movie.original_title && (
                                                <p className="text-[10px] text-neutral-500">{movie.original_title}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-space uppercase tracking-widest px-2 py-1 rounded-full border"
                                            style={{ color: movie.type === 'series' ? '#00f5ff' : '#ff2d78', borderColor: movie.type === 'series' ? 'rgba(0,245,255,0.3)' : 'rgba(255,45,120,0.3)', backgroundColor: movie.type === 'series' ? 'rgba(0,245,255,0.05)' : 'rgba(255,45,120,0.05)' }}>
                                            {movie.type === 'series' ? 'Series' : 'Film'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-neutral-400 font-space">{movie.release_year || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-space uppercase tracking-widest font-bold"
                                            style={{ color: movie.source === 'tmdb' ? '#aaff00' : '#ffd600' }}>
                                            {movie.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-neutral-400 font-space">{(movie as MovieRow).review_count ?? 0}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(movie.id)}
                                            disabled={deleteLoading === movie.id}
                                            className="text-xs font-space text-neon-red hover:text-neon-red/80 transition-colors uppercase tracking-widest font-bold tracking-widest"
                                        >
                                            {deleteLoading === movie.id ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {movies.length === 0 && (
                        <div className="p-8 text-center text-neutral-600 font-space text-sm">No titles yet.</div>
                    )}
                </div>
            </section>
        </div>
    );
}
