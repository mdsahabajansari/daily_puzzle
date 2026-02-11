/**
 * StreakHeatmap.jsx — GitHub-style streak visualization
 */

import { motion } from 'framer-motion';
import { useStreakStore } from './streakStore';

/** Color mapping based on number of puzzles completed */
function getColor(count) {
    if (count === 0) return 'bg-slate-800/50';
    if (count === 1) return 'bg-emerald-900';
    if (count === 2) return 'bg-emerald-700';
    if (count === 3) return 'bg-emerald-500';
    if (count === 4) return 'bg-emerald-400';
    return 'bg-amber-400';
}

/** Tooltip label for a day */
function getLabel(date, count) {
    const d = new Date(date);
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (count === 0) return `${formatted}: No puzzles`;
    return `${formatted}: ${count} puzzle${count > 1 ? 's' : ''}`;
}

export default function StreakHeatmap({ days = 365 }) {
    const { getHeatmapData, currentStreak, longestStreak, totalScore } = useStreakStore();
    const data = getHeatmapData(days);

    const weeks = [];
    let currentWeek = [];

    const firstDayOfWeek = new Date(data[0]?.date || Date.now()).getDay();
    const padding = (firstDayOfWeek + 6) % 7;
    for (let i = 0; i < padding; i++) {
        currentWeek.push({ date: '', count: -1 });
    }

    for (const day of data) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6"
        >
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gradient">Activity</h3>
                <div className="flex gap-6 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">{currentStreak}</div>
                        <div className="text-slate-500 text-xs">Current Streak</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">{longestStreak}</div>
                        <div className="text-slate-500 text-xs">Longest Streak</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-brand-400">{totalScore.toLocaleString()}</div>
                        <div className="text-slate-500 text-xs">Total Score</div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-[3px] min-w-fit">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-[3px]">
                            {week.map((day, di) => (
                                <div key={`${wi}-${di}`} className="relative group">
                                    {day.count >= 0 ? (
                                        <>
                                            <div
                                                className={`w-[13px] h-[13px] rounded-sm ${getColor(day.count)} transition-colors`}
                                            />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {getLabel(day.date, day.count)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-[13px] h-[13px]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <span>Less</span>
                {[0, 1, 2, 3, 4, 5].map((count) => (
                    <div key={count} className={`w-[13px] h-[13px] rounded-sm ${getColor(count)}`} />
                ))}
                <span>More</span>
            </div>
        </motion.div>
    );
}
