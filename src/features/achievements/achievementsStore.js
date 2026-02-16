/**
 * achievementsStore.js — Manage badges and milestones
 */
import { create } from 'zustand';
import { achievementsStorage } from '@/storage/indexedDB';

const BADGES = [
    { id: 'streak_7', label: '7 Day Streak', icon: '🔥', description: 'Solved puzzles for 7 consecutive days', condition: (stats) => stats.streak >= 7 },
    { id: 'streak_30', label: 'Month Master', icon: '📅', description: '30 day streak! Incredible focus.', condition: (stats) => stats.streak >= 30 },
    { id: 'streak_100', label: 'Century Club', icon: '💯', description: '100 day streak. You are unstoppable.', condition: (stats) => stats.streak >= 100 },
    { id: 'perfect_score', label: 'Perfectionist', icon: '✨', description: 'Achieved a perfect score (>300) in a single day.', condition: (stats) => stats.maxScore >= 300 },
    { id: 'puzzle_50', label: 'Puzzle Veteran', icon: '🧩', description: 'Solved 50 total puzzles.', condition: (stats) => stats.totalSolved >= 50 },
];

export const useAchievementsStore = create((set, get) => ({
    unlocked: [], // Array of badge IDs
    newlyUnlocked: [], // Badges unlocked in the latest check
    isLoading: true,

    initialize: async () => {
        set({ isLoading: true });
        try {
            const stored = await achievementsStorage.getAll();
            const unlocked = stored.map(s => s.id);
            set({ unlocked, isLoading: false });
        } catch (error) {
            console.error('Achievements init failed:', error);
            set({ isLoading: false });
        }
    },

    /**
     * Check for new achievements based on current stats
     * @param {Object} stats - { streak, maxScore, totalSolved }
     */
    checkAchievements: async (stats) => {
        const state = get();
        const newUnlocks = [];

        for (const badge of BADGES) {
            if (!state.unlocked.includes(badge.id)) {
                if (badge.condition(stats)) {
                    newUnlocks.push(badge.id);
                    // Persist
                    await achievementsStorage.put({ id: badge.id, unlockedAt: Date.now() });
                }
            }
        }

        if (newUnlocks.length > 0) {
            set({
                unlocked: [...state.unlocked, ...newUnlocks],
                newlyUnlocked: newUnlocks
            });
        }
    },

    getAllBadges: () => BADGES
}));
