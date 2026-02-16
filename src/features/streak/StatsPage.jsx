import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeatmapContainer from './components/HeatmapContainer';
import BadgeList from '@/features/achievements/components/BadgeList';
import { useStreakStore } from './streakStore';
import { getUnsyncedCount } from '@/services/sync';
import { useState } from 'react';

export default function StatsPage() {
    const initialize = useStreakStore((s) => s.initialize);
    const isLoading = useStreakStore((s) => s.isLoading);
    const initError = useStreakStore((s) => s.initError);
    const currentStreak = useStreakStore((s) => s.currentStreak);
    const longestStreak = useStreakStore((s) => s.longestStreak);
    const totalScore = useStreakStore((s) => s.totalScore);
    const activityMap = useStreakStore((s) => s.activityMap);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    useEffect(() => {
        async function checkSync() {
            const count = await getUnsyncedCount();
            setUnsyncedCount(count);
        }
        checkSync();
        // Check again every 10 seconds or when activityMap changes
        const interval = setInterval(checkSync, 10000);
        return () => clearInterval(interval);
    }, [activityMap]);

    useEffect(() => {
        initialize();
    }, []); // Run once on mount — initialize is stable (Zustand)

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="text-6xl"
                >
                    📊
                </motion.div>
                <div className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                    Loading neural performance data...
                </div>
            </div>
        );
    }

    // Error state
    if (initError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-5xl">⚠️</div>
                <p className="text-red-400 text-sm">Failed to load stats: {initError}</p>
                <button
                    onClick={() => initialize()}
                    className="btn-primary text-xs px-6 py-2"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Robust fallbacks for all data points
    const safeActivityMap = activityMap || {};
    const safeCurrentStreak = currentStreak || 0;
    const safeLongestStreak = longestStreak || 0;
    const safeTotalScore = totalScore || 0;

    const activityValues = Object.values(safeActivityMap).filter((entry) => entry.solved);
    const daysPlayed = activityValues.length;
    const totalPuzzles = daysPlayed;

    // Sync rate foundation
    const syncedCount = activityValues.filter((a) => a.synced).length;
    const syncRate = daysPlayed > 0 ? Math.round((syncedCount / daysPlayed) * 100) : 100;

    return (
        <div className="space-y-10 max-w-4xl mx-auto pb-12">
            <header>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">Neural Performance Log</h2>
                <div className="flex items-center gap-3 mt-1">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)] ${unsyncedCount > 0 ? 'bg-amber-400 animate-bounce' : 'bg-brand-500 animate-pulse'}`} />
                    <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                        {unsyncedCount > 0 ? `${unsyncedCount} Neural Updates Pending Sync...` : 'Cloud Protected • Cognitive metrics synchronized'}
                    </p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4"
            >
                <StatCard icon="🔥" label="Current Streak" value={safeCurrentStreak} unit="Days" />
                <StatCard icon="👑" label="Peak Record" value={safeLongestStreak} unit="Days" />
                <StatCard icon="✅" label="Total Puzzles" value={totalPuzzles} unit="Units" />
                <StatCard icon="⭐️" label="Global Score" value={safeTotalScore.toLocaleString()} unit="XP" />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1 glass p-6 md:p-8 space-y-6"
                >
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Metric Breakdown</h3>
                    <div className="space-y-4">
                        <SmallStat label="Active Days" value={daysPlayed} />
                        <SmallStat label="Avg Load/Day" value={daysPlayed > 0 ? (totalPuzzles / daysPlayed).toFixed(1) : '0.0'} />
                        <SmallStat label="Avg Efficiency" value={totalPuzzles > 0 ? Math.round(safeTotalScore / totalPuzzles) : 0} />
                        <SmallStat label="Sync Rate" value={`${syncRate}%`} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="glass p-6 md:p-8 overflow-hidden">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Activity Heatmap</h3>
                        <HeatmapContainer />
                    </div>

                    <div className="glass p-6 md:p-8 overflow-hidden">
                        <BadgeList />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, unit }) {
    return (
        <div className="glass-hover p-4 md:p-6 border-b-4 border-b-brand-600/50">
            <div className="text-xl md:text-2xl mb-2 md:mb-3">{icon}</div>
            <div className="space-y-1">
                <div className="text-[10px] md:text-xs font-black text-slate-400 border-b border-white/5 pb-1 mb-1 uppercase tracking-tighter">{label}</div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-white">{value}</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
                </div>
            </div>
        </div>
    );
}

function SmallStat({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            <span className="text-sm font-bold text-brand-300">{value}</span>
        </div>
    );
}
