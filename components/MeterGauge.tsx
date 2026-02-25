'use client';

import { motion } from 'framer-motion';

interface MeterGaugeProps {
    counts: Record<string, number>;
    total: number;
}

const METER_COLORS: Record<string, { color: string; label: string; bg: string }> = {
    perfection: { color: '#8B5CF6', label: 'Perfection', bg: 'rgba(139, 92, 246, 0.15)' },
    go_for_it: { color: '#14B8A6', label: 'Go For It', bg: 'rgba(20, 184, 166, 0.15)' },
    timepass: { color: '#F59E0B', label: 'Timepass', bg: 'rgba(245, 158, 11, 0.15)' },
    disaster: { color: '#EF4444', label: 'Disaster', bg: 'rgba(239, 68, 68, 0.15)' },
};

export function MeterGauge({ counts, total }: MeterGaugeProps) {
    if (total === 0) return null;

    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Build segments
    const order = ['perfection', 'go_for_it', 'timepass', 'disaster'];
    let cumulativeOffset = 0;
    const segments = order
        .filter(key => (counts[key] || 0) > 0)
        .map(key => {
            const count = counts[key] || 0;
            const pct = count / total;
            const dashLength = pct * circumference;
            const gap = circumference - dashLength;
            const offset = -cumulativeOffset;
            cumulativeOffset += dashLength;
            return { key, pct, dashLength, gap, offset, ...METER_COLORS[key] };
        });

    // Dominant rating
    const dominant = segments.length > 0 ? segments.reduce((a, b) => a.pct > b.pct ? a : b) : null;

    return (
        <div className="liquid-glass rounded-3xl p-8 glass-shimmer">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em] mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-white/20" />
                Community Verdict
                <span className="w-6 h-px bg-white/20" />
            </p>

            <div className="flex items-center gap-8">
                {/* Circular Gauge */}
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={center} cy={center} r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Rating segments */}
                        {segments.map((seg, i) => (
                            <motion.circle
                                key={seg.key}
                                cx={center} cy={center} r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={`${seg.dashLength} ${seg.gap}`}
                                strokeDashoffset={seg.offset}
                                initial={{ strokeDasharray: `0 ${circumference}` }}
                                animate={{ strokeDasharray: `${seg.dashLength} ${seg.gap}` }}
                                transition={{ duration: 1, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                            />
                        ))}
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-display font-bold text-white">{total}</span>
                        <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">
                            {total === 1 ? 'Vote' : 'Votes'}
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 flex-1">
                    {segments.map(seg => {
                        const pctDisplay = Math.round(seg.pct * 100);
                        return (
                            <div key={seg.key} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                                <span className="text-xs font-semibold text-white/80 flex-1 uppercase tracking-wider">{seg.label}</span>
                                <span className="text-xs font-bold text-white/60">{pctDisplay}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dominant verdict badge */}
            {dominant && (
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dominant.color }} />
                        <span className="text-sm font-display font-bold text-white uppercase tracking-wider">{dominant.label}</span>
                        <span className="text-xs text-white/40 font-medium">— Community Consensus</span>
                    </div>
                </div>
            )}
        </div>
    );
}
