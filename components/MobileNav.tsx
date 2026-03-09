'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const userImage = session?.user?.image;
    const userName = session?.user?.name || 'User';

    const tabs = [
        {
            name: 'Home',
            href: '/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Explore',
            href: '/search',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
        },
        {
            name: 'Profile',
            href: session ? '/profile' : '/login',
            icon: userImage ? (
                <img src={userImage} className="w-6 h-6 rounded-full object-cover" alt="" />
            ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amethyst to-rose flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{userName[0]?.toUpperCase()}</span>
                </div>
            ),
        },
    ];

    return (
        <>
            {/* Bottom spacer so content doesn't completely hide under the mobile nav */}
            <div className="h-24 md:hidden" />

            <motion.nav 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe"
            >
                <div className="bg-surface-100 border-t border-white/[0.05] px-6 py-2 pb-6 flex items-center justify-around shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;

                        return (
                            <Link 
                                key={tab.name} 
                                href={tab.href}
                                className="relative flex flex-col items-center justify-center w-16 h-14"
                            >
                                <motion.div
                                    animate={{ 
                                        y: isActive ? -2 : 0,
                                        scale: isActive ? 1.05 : 1 
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`relative z-10 p-1.5 rounded-xl transition-colors duration-300 ${
                                        isActive ? 'text-rose' : 'text-white/40 hover:text-white/70'
                                    }`}
                                >
                                    {tab.icon}
                                </motion.div>
                                
                                <span className={`text-[10px] font-bold transition-all duration-300 ${
                                    isActive ? 'text-white opacity-100' : 'text-white/30 opacity-100 transform translate-y-0.5'
                                }`}>
                                    {tab.name}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavIndicator"
                                        className="absolute -top-2 w-8 h-1 bg-rose rounded-b-full shadow-[0_0_10px_rgba(244,63,94,0.5)] z-20"
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </motion.nav>
        </>
    );
}
