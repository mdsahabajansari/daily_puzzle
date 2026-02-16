/**
 * HeatmapCell.jsx — Individual day in the heatmap
 */
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { formatTooltipDate } from '../utils/dateUtils';

// Color mapping based on intensity (0-4)
const INTENSITY_COLORS = {
    0: 'bg-slate-800/30',      // Not played
    1: 'bg-brand-900',         // Solved
    2: 'bg-brand-700',         // Good
    3: 'bg-brand-500',         // Great
    4: 'bg-amber-400',         // Perfect
};

const HeatmapCell = memo(({ date, intensity = 0, index }) => {
    // If no date (padding cell), render invisible placeholder
    if (!date) {
        return <div className="w-3 h-3" />;
    }

    const colorClass = INTENSITY_COLORS[intensity] || INTENSITY_COLORS[0];
    const label = `${formatTooltipDate(date)}${intensity > 0 ? `: Level ${intensity}` : ': No activity'}`;

    return (
        <div className="relative group">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.002, duration: 0.2 }}
                className={`w-3 h-3 rounded-sm ${colorClass} border border-white/5 transition-all duration-300 group-hover:scale-125 group-hover:z-10 group-hover:shadow-[0_0_8px_rgba(79,70,229,0.5)] cursor-pointer`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-white/10 text-[10px] text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {label}
            </div>
        </div>
    );
});

HeatmapCell.displayName = 'HeatmapCell';

export default HeatmapCell;
