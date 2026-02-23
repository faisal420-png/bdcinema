'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlitchText } from '@/components/GlitchText';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get('name') as string;
        const email = fd.get('email') as string;
        const password = fd.get('password') as string;

        const res = await fetch('/api/auth/register', {
            method: 'POST', body: JSON.stringify({ name, email, password })
        });

        if (res.ok) {
            router.push('/login');
        } else {
            alert('Failed to register. Maybe email in use?');
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-neutral-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

            <div className="w-full max-w-lg bg-white/[0.02] backdrop-blur-[40px] border border-white/10 p-10 md:p-12 rounded-3xl relative z-10 shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
                <Link href="/" className="inline-block group mb-10">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                        BD<span className="text-white/40 group-hover:text-white transition-colors duration-500">CINEMA</span>
                    </h1>
                    <div className="h-px w-0 group-hover:w-full bg-white transition-all duration-500 mt-1" />
                </Link>

                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white/50 mb-8">Join the Audience</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase mb-2 ml-1">Full Name</label>
                        <input name="name" required
                            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-white px-5 py-4 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 placeholder:text-white/20"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase mb-2 ml-1">Email Address</label>
                        <input name="email" type="email" required
                            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-white px-5 py-4 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 placeholder:text-white/20"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase mb-2 ml-1">Password</label>
                        <input name="password" type="password" required minLength={6}
                            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-white px-5 py-4 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 placeholder:text-white/20"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit"
                        className="w-full mt-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] hover:bg-neutral-300 transition-all duration-300">
                        Get Ticket
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                        Already have a ticket? <Link href="/login" className="text-white hover:underline ms-2">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
