/**
 * BadgeList.jsx — Display list of earned and locked achievements
 */
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAchievementsStore } from '../achievementsStore';
import { useStreakStore } from '@/features/streak/streakStore';

export default function BadgeList() {
    const unlocked = useAchievementsStore((s) => s.unlocked);
    const getAllBadges = useAchievementsStore((s) => s.getAllBadges);
    const initAchievements = useAchievementsStore((s) => s.initialize);
    const checkAchievements = useAchievementsStore((s) => s.checkAchievements);

    const currentStreak = useStreakStore((s) => s.currentStreak);
    const activityMap = useStreakStore((s) => s.activityMap);

    useEffect(() => {
        initAchievements();
    }, []); // Zustand functions are stable

    // Check achievements whenever stats change
    useEffect(() => {
        if (!activityMap || Object.keys(activityMap).length === 0) return;

        const values = Object.values(activityMap).filter((e) => e.solved);
        let maxScore = 0;
        values.forEach((v) => {
            if (v.score > maxScore) maxScore = v.score;
        });

        checkAchievements({
            streak: currentStreak,
            maxScore,
            totalSolved: values.length,
        });
    }, [currentStreak, activityMap]); // Only re-check when these values actually change

    const badges = useMemo(() => getAllBadges(), []);

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, index) => {
                    const isUnlocked = unlocked.includes(badge.id);
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border ${isUnlocked
                                    ? 'bg-slate-900/50 border-brand-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                    : 'bg-slate-900/20 border-white/5 opacity-50 grayscale'
                                }`}
                        >
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <div className="font-bold text-sm text-white">{badge.label}</div>
                            <div className="text-[10px] text-slate-400 mt-1 leading-tight">{badge.description}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
