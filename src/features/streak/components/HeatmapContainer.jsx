/**
 * HeatmapContainer.jsx — Data provider and layout for Heatmap
 */
import React, { useMemo } from 'react';
import { useStreakStore } from '../streakStore';
import HeatmapGrid from './HeatmapGrid';

export default function HeatmapContainer() {
    const getHeatmapIntensity = useStreakStore((s) => s.getHeatmapIntensity);
    const isLoading = useStreakStore((s) => s.isLoading);
    const activityMap = useStreakStore((s) => s.activityMap);

    // Recompute intensity only when activityMap changes
    const intensityMap = useMemo(() => getHeatmapIntensity(), [activityMap]);

    if (isLoading) {
        return (
            <div className="h-40 flex items-center justify-center text-slate-500 text-xs animate-pulse">
                Loading neural activity...
            </div>
        );
    }

    return (
        <div className="w-full">
            <HeatmapGrid intensityData={intensityMap} />

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-slate-500 font-mono uppercase">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-800/30 border border-white/5"></div>
                <div className="w-3 h-3 rounded-sm bg-brand-900 border border-white/5"></div>
                <div className="w-3 h-3 rounded-sm bg-brand-700 border border-white/5"></div>
                <div className="w-3 h-3 rounded-sm bg-brand-500 border border-white/5"></div>
                <div className="w-3 h-3 rounded-sm bg-amber-400 border border-white/5"></div>
                <span>More</span>
            </div>
        </div>
    );
}
