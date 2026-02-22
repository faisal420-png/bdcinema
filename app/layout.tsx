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
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased bg-surface text-zinc-200">
                <SessionProvider session={session}>
                    <div className="relative min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <footer className="border-t border-white/5 mt-16">
                            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                                        <span className="text-white font-black text-[10px]">B</span>
                                    </div>
                                    <span className="font-bold text-sm text-white">BD<span className="text-accent-light">Cinema</span></span>
                                </div>
                                <p className="text-xs text-zinc-600">
                                    © 2025 BDCinema · No sugarcoating. Just the Meter.
                                </p>
                            </div>
                        </footer>
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
