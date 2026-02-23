'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const fd = new FormData(e.currentTarget);
        const email = fd.get('email') as string;
        const password = fd.get('password') as string;

        const res = await signIn('credentials', { email, password, redirect: false });
        setIsLoading(false);
        if (res?.error) alert('Invalid credentials');
        else router.push('/');
    }

    async function handleGoogleSignIn() {
        setIsGoogleLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            setIsGoogleLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-neutral-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            {/* Ambient Background Glows */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md bg-white/[0.02] backdrop-blur-[40px] border border-white/10 p-10 md:p-12 rounded-3xl relative z-10 shadow-[0_32px_64px_rgba(0,0,0,0.8)]"
            >
                <Link href="/" className="inline-block group mb-10">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative">
                        BD<span className="text-white/40 group-hover:text-white transition-colors duration-500">CINEMA</span>
                    </h1>
                    <div className="h-px w-0 group-hover:w-full bg-white transition-all duration-500 mt-1" />
                </Link>

                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white/50 mb-8">Authenticate</h2>

                {/* Secure Sign In with Google */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="group w-full relative mb-6 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isGoogleLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    <span className="text-white text-sm font-semibold tracking-wide">Continue with Google</span>
                </button>

                <div className="relative flex items-center mb-8">
                    <div className="flex-grow border-t border-white/10" />
                    <span className="flex-shrink-0 mx-4 text-white/30 text-xs font-semibold tracking-widest uppercase">Or Operative Manual</span>
                    <div className="flex-grow border-t border-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <input
                            type="email"
                            name="email"
                            required
                            disabled={isLoading || isGoogleLoading}
                            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-white px-5 py-4 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 placeholder:text-white/20 disabled:opacity-50"
                            placeholder="Operative Designation (Email)"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            required
                            disabled={isLoading || isGoogleLoading}
                            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-white px-5 py-4 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 placeholder:text-white/20 disabled:opacity-50"
                            placeholder="Access Code"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        className="w-full py-4 mt-2 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] hover:bg-neutral-200 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Enter Database'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                        New Operative? <Link href="/register" className="text-white hover:underline ms-2">Request Clearance</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
