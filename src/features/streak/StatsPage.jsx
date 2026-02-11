import { useEffect } from 'react';
import { motion } from 'framer-motion';
import StreakHeatmap from './StreakHeatmap';
import { useStreakStore } from './streakStore';

export default function StatsPage() {
    const { initialize, currentStreak, longestStreak, totalScore, history } = useStreakStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    const daysPlayed = Object.values(history).filter((count) => count > 0).length;
    const totalPuzzles = Object.values(history).reduce((sum, count) => sum + count, 0);

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <header>
                <h2 className="text-3xl font-black tracking-tight">PERFORMANCE ANALYTICS</h2>
                <div className="flex items-center gap-3 mt-1">
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                    <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">Real-time cognitive metrics synced</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <StatCard icon="🔥" label="Current Streak" value={currentStreak} unit="Days" />
                <StatCard icon="👑" label="Peak Record" value={longestStreak} unit="Days" />
                <StatCard icon="✅" label="Total Puzzles" value={totalPuzzles} unit="Units" />
                <StatCard icon="⭐️" label="Global Score" value={totalScore.toLocaleString()} unit="XP" />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="md:col-span-1 glass p-8 space-y-6"
                >
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Metric Breakdown</h3>
                    <div className="space-y-4">
                        <SmallStat label="Active Days" value={daysPlayed} />
                        <SmallStat label="Avg Load/Day" value={daysPlayed > 0 ? (totalPuzzles / daysPlayed).toFixed(1) : 0} />
                        <SmallStat label="Avg Efficiency" value={totalPuzzles > 0 ? Math.round(totalScore / totalPuzzles) : 0} />
                        <SmallStat label="Sync Rate" value={`${daysPlayed > 0 ? Math.round((totalPuzzles / (daysPlayed * 5)) * 100) : 0}%`} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="md:col-span-2 glass p-8 overflow-hidden"
                >
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Neural Activity Heatmap</h3>
                    <StreakHeatmap days={365} />
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, unit }) {
    return (
        <div className="glass-hover p-6 border-b-4 border-b-brand-600/50">
            <div className="text-2xl mb-3">{icon}</div>
            <div className="space-y-1">
                <div className="text-sm font-black text-slate-400 uppercase tracking-tighter">{label}</div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{value}</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
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
