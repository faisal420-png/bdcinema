'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from './MagneticButton';

export function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
            setMenuOpen(false);
        }
    };

    const userImage = session?.user?.image;
    const userName = session?.user?.name || 'User';

    return (
        <>
            <motion.nav 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-spring ${scrolled ? 'py-2' : 'py-4'}`}
            >
                <div className={`max-w-6xl mx-auto mx-4 sm:mx-6 lg:mx-auto px-4 sm:px-6 py-3 rounded-2xl transition-all duration-700 ease-spring ${scrolled
                        ? 'liquid-glass-strong'
                        : 'bg-transparent'
                    }`}>
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <MagneticButton>
                            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amethyst to-amethyst-dark flex items-center justify-center shadow-lg group-hover:shadow-amethyst-glow transition-shadow duration-500">
                                    <span className="text-white font-black text-xs">B</span>
                                </div>
                                <span className="font-display font-bold text-base text-white hidden sm:block">
                                    BD<span className="text-amethyst-light">Cinema</span>
                                </span>
                            </Link>
                        </MagneticButton>

                        {/* Center Search */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto">
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search movies, series..."
                                    className="w-full glass-input rounded-full pl-10 pr-4 py-2.5 text-sm font-medium"
                                />
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amethyst-light transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>

                                {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {session?.user ? (
                                <>
                                    {/* Admin Link */}
                                    {(session.user as any).role === 'admin' && (
                                        <Link href="/admin" className="glass-pill hover:bg-white/10 transition-all duration-300 hidden sm:block">
                                            Admin
                                        </Link>
                                    )}

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setProfileOpen(!profileOpen)}
                                            className="flex items-center gap-2 glass-btn rounded-full px-1.5 py-1.5 pr-3"
                                        >
                                            {userImage ? (
                                                <img src={userImage} className="w-7 h-7 rounded-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amethyst to-rose flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">{userName[0]?.toUpperCase()}</span>
                                                </div>
                                            )}
                                            <span className="text-xs font-semibold text-white/80 hidden sm:block">{userName.split(' ')[0]}</span>
                                            <svg className={`w-3 h-3 text-white/40 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <AnimatePresence>
                                            {profileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl liquid-glass-strong overflow-hidden"
                                                >
                                                    <div className="p-2">
                                                        <Link href="/profile" onClick={() => setProfileOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-all duration-300">
                                                            <svg className="w-4 h-4 text-amethyst-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                            Profile
                                                        </Link>
                                                        <div className="my-1 h-px bg-white/[0.06]" />
                                                        <button onClick={() => { setProfileOpen(false); signOut(); }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-light/80 hover:text-rose-light hover:bg-rose/[0.06] transition-all duration-300">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <MagneticButton>
                                        <Link href="/login" className="glass-pill hover:bg-white/10 transition-all duration-300 text-white/70 hover:text-white">
                                            Sign In
                                        </Link>
                                    </MagneticButton>
                                    <MagneticButton>
                                        <Link href="/register" className="glass-btn-primary glass-btn rounded-full px-4 py-2 text-xs font-bold tracking-wider">
                                            Join
                                        </Link>
                                    </MagneticButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Spacer for fixed nav */}
            <div className="hidden md:block h-20" />
        </>
    );
}
