'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const [isFocused, setIsFocused] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLFormElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setResults(data.results || []);
                } catch (error) {
                    console.error('Failed to fetch suggestions:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsFocused(false);
        }
    };

    return (
        <header className="fixed top-6 left-0 right-0 z-50 pointer-events-none px-4 flex justify-center">
            <nav className="w-full max-w-5xl bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-full px-6 h-16 flex items-center justify-between pointer-events-auto transition-all duration-500">
                <Link href="/" className="flex items-center gap-1.5 group">
                    <span className="font-semibold text-xl tracking-tight text-white drop-shadow-md">
                        BDCinema
                    </span>
                </Link>

                <div className="flex items-center gap-6 sm:gap-10">
                    {/* Global Multi-Search Form */}
                    <form ref={searchRef} onSubmit={handleSearch} className="relative hidden md:flex items-center">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            placeholder="Search..."
                            className="w-48 focus:w-64 bg-white/[0.03] border border-white/10 rounded-full pl-5 pr-10 py-1.5 text-xs text-white font-medium tracking-wide placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner"
                        />
                        <button type="submit" className="absolute right-3 text-white/50 hover:text-white transition-colors" aria-label="Submit search">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>

                        {/* Dropdown Suggestions */}
                        <AnimatePresence>
                            {isFocused && searchQuery.trim().length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute top-12 right-0 w-[400px] bg-white/[0.02] backdrop-blur-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-white/10 rounded-3xl p-2 z-50 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                                    <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-black/20">
                                        {isSearching ? (
                                            <div className="p-6 flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            </div>
                                        ) : results.length > 0 ? (
                                            <ul className="flex flex-col py-2">
                                                {results.map((item) => (
                                                    <li key={item.id} className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                router.push(`/movies/${item.id}?type=${item.media_type === 'tv' ? 'series' : 'movie'}`);
                                                                setSearchQuery('');
                                                                setIsFocused(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-white/[0.05] transition-colors flex items-center gap-4 group"
                                                        >
                                                            {item.poster_path ? (
                                                                <div className="w-10 rounded-md overflow-hidden bg-neutral-800 shadow-sm object-cover aspect-[2/3] border border-white/5 group-hover:border-white/20 transition-colors">
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                                        alt={item.title || item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 rounded-md bg-white/5 flex items-center justify-center aspect-[2/3] border border-white/5 group-hover:border-white/20 transition-colors">
                                                                    <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <p className="text-sm font-medium text-white/90 truncate mb-0.5 group-hover:text-white transition-colors">
                                                                    {item.title || item.name}
                                                                </p>
                                                                <p className="text-[10px] text-white/50 tracking-wide flex items-center gap-1.5">
                                                                    <span className="opacity-80 md:bg-white/5 md:px-1.5 md:py-0.5 md:rounded-sm">{item.media_type === 'tv' ? 'Series' : 'Film'}</span>
                                                                    {(item.release_date || item.first_air_date) && (
                                                                        <>
                                                                            <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
                                                                            <span>{(item.release_date?.split('-')[0]) || (item.first_air_date?.split('-')[0])}</span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-xs font-medium text-white/40">No results found</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    {session ? (
                        <div className="flex items-center gap-5">
                            <Link
                                href={(session.user as any)?.role === 'admin' ? '/admin' : '/profile'}
                                className="text-xs font-medium text-white/80 hidden sm:block hover:text-white transition-colors drop-shadow-md"
                            >
                                {session.user?.name}
                            </Link>
                            <button onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-[10px] font-semibold text-white/60 tracking-wider hover:text-white transition-colors duration-300">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login"
                            className="text-[11px] font-semibold bg-white text-black px-4 py-1.5 rounded-full tracking-wide hover:bg-neutral-200 hover:scale-105 transition-all duration-300 shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.2)]">
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
