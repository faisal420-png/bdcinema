import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
    title: "BDCinema — Bangladesh Film & Series Reviews",
    description: "The ultimate review platform for Bangladeshi cinema and web series. Rate films with the Meter: Disaster, Timepass, Go For It, or Perfection.",
    keywords: ["bangladesh", "cinema", "movies", "web series", "reviews", "hawa", "karagar", "mohanagar", "taqdeer"],
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased bg-midnight text-zinc-200">
                {/* Mesh Gradient Background */}
                <div className="mesh-gradient-bg" aria-hidden="true">
                    <div className="mesh-orb-rose" />
                </div>

                <SessionProvider session={session}>
                    <div className="relative min-h-screen flex flex-col z-10">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <footer className="relative mt-16">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amethyst/20 to-transparent" />
                            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl liquid-glass flex items-center justify-center">
                                        <span className="text-amethyst-light font-black text-xs">B</span>
                                    </div>
                                    <span className="font-display font-bold text-sm text-white">BD<span className="text-amethyst-light">Cinema</span></span>
                                </div>
                                <p className="text-xs text-white/30 font-medium tracking-wider">
                                    © 2025 BDCinema · No sugarcoating. Just the Meter.
                                </p>
                                <div className="flex items-center gap-4">
                                    <span className="glass-pill text-white/40">About</span>
                                    <span className="glass-pill text-white/40">Contact</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
