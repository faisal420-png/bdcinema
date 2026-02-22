'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MeterRatingValue = 'disaster' | 'timepass' | 'go_for_it' | 'perfection';

const TIERS: Record<MeterRatingValue, { label: string; code: string; color: string; bgClass: string; glowClass: string; icon: React.ReactNode }> = {
    disaster: {
        label: 'DISASTER',
        code: '[DR]',
        color: '#ef4444',
        bgClass: 'bg-red-500/10 border-red-500/30 text-red-500',
        glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        // Broken heart
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M12 5 9.04 9.53a2 2 0 0 0-1 1.77A2 2 0 0 0 10 13l2-1" /></svg>
    },
    timepass: {
        label: 'TIMEPASS',
        code: '[TP]',
        color: '#60a5fa',
        bgClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        glowClass: 'shadow-[0_0_20px_rgba(96,165,250,0.4)]',
        // Clock
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    },
    go_for_it: {
        label: 'GO FOR IT',
        code: '[GF]',
        color: '#f97316',
        bgClass: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
        // Flame
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
    },
    perfection: {
        label: 'PERFECTION',
        code: '[PF]',
        color: '#fbbf24',
        bgClass: 'bg-yellow-400/10 border-yellow-400/40 text-yellow-300',
        glowClass: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
        // Sparkle / Star
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.29 1.29L3 12l5.8 1.9a2 2 0 0 1 1.29 1.29L12 21l1.9-5.8a2 2 0 0 1 1.29-1.29L21 12l-5.8-1.9a2 2 0 0 1-1.29-1.29L12 3Z" /></svg>
    },
};

const ORDERED_TIERS: MeterRatingValue[] = ['disaster', 'timepass', 'go_for_it', 'perfection'];

export function MeterRating({ value, onChange, readonly = false }: {
    value?: MeterRatingValue | null;
    onChange?: (v: MeterRatingValue) => void;
    readonly?: boolean;
}) {
    const [hoveredKey, setHoveredKey] = useState<MeterRatingValue | null>(null);

    const selectedIndex = value ? ORDERED_TIERS.indexOf(value) : -1;
    const activeKey = hoveredKey || value;
    const activeTier = activeKey ? TIERS[activeKey] : null;

    return (
        <div className="relative w-full max-w-2xl py-8 flex flex-col items-center">
            <div className="relative w-full">
                {/* The Track Line */}
                <div className="absolute top-1/2 left-[40px] md:left-[64px] right-[40px] md:right-[64px] h-1 bg-white/5 rounded-full -translate-y-1/2 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-white/10 to-white/60 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: selectedIndex >= 0 ? `${(selectedIndex / (ORDERED_TIERS.length - 1)) * 100}%` : '0%' }}
                        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    />
                </div>

                <div className="relative flex justify-between items-center z-10 w-full px-4 md:px-8">
                    {ORDERED_TIERS.map((key, index) => {
                        const tier = TIERS[key];
                        const isSelected = value === key;
                        const isPast = selectedIndex >= index;

                        return (
                            <div key={key} className="relative flex flex-col items-center group">
                                <motion.button
                                    type="button"
                                    disabled={readonly}
                                    onClick={() => onChange?.(key)}
                                    onMouseEnter={() => !readonly && setHoveredKey(key)}
                                    onMouseLeave={() => !readonly && setHoveredKey(null)}
                                    whileHover={!readonly ? { scale: 1.15 } : {}}
                                    whileTap={!readonly ? { scale: 0.9 } : {}}
                                    className={`
                                        relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border-2 
                                        transition-all duration-500 ease-out backdrop-blur-md
                                        ${isSelected ? tier.bgClass + ' ' + tier.glowClass + ' scale-110 border-opacity-100' :
                                            isPast ? 'bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' :
                                                'bg-[#111] border-white/10 text-white/30 hover:border-white/30 hover:text-white/60'
                                        }
                                    `}
                                    style={{ cursor: readonly ? 'default' : 'pointer' }}
                                >
                                    <div className={`w-5 h-5 md:w-7 md:h-7 transition-colors duration-500 ${isSelected ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                                        {tier.icon}
                                    </div>

                                    {/* Inner glow for selected */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className="absolute inset-0 rounded-full bg-current opacity-20 blur-md"
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Single Label */}
            <div className="mt-8 h-6 flex justify-center items-center">
                <AnimatePresence mode="wait">
                    {activeTier ? (
                        <motion.div
                            key={activeTier.label}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <span className={`text-xs md:text-sm font-black uppercase tracking-[0.3em] drop-shadow-md 
                                ${hoveredKey && hoveredKey !== value ? 'text-white/70' : 'text-white'}`}
                            >
                                {activeTier.label}
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="unselected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-white/30"
                        >
                            Select Rating
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function MeterBadge({ rating, compact = false }: { rating: MeterRatingValue; compact?: boolean }) {
    const tier = TIERS[rating];
    if (!tier) return null;
    return (
        <span className={`
            inline-flex items-center gap-1.5 md:gap-2 font-black tracking-[0.15em] uppercase border backdrop-blur-md
            ${compact ? 'text-[9px] px-2 py-1 rounded-sm' : 'text-xs px-3 py-1.5 rounded-md'}
            ${tier.bgClass} shadow-md group-hover:shadow-lg transition-all duration-300
        `}>
            <span className={`w-3 h-3 ${compact ? '' : 'md:w-4 md:h-4'}`}>
                {tier.icon}
            </span>
            <span className="drop-shadow-sm">{tier.label}</span>
        </span>
    );
}

export const METER_LABELS: Record<MeterRatingValue, string> = {
    disaster: 'DISASTER', timepass: 'TIMEPASS', go_for_it: 'GO FOR IT', perfection: 'PERFECTION',
};
