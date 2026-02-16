/**
 * streakStore.js — Streak tracking with Zustand
 *
 * Reads from BOTH the legacy 'streaks' store and the new 'dailyActivity' store
 * so existing user data is not lost after the migration.
 */

import { create } from 'zustand';
import { activityStorage, streakStorage } from '@/storage/indexedDB';
import { getTodayISO } from './utils/dateUtils';
import { calculateStreak, calculateLongestStreak } from './utils/streakLogic';

export const useStreakStore = create((set, get) => ({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    totalScore: 0,
    activityMap: {}, // 'YYYY-MM-DD' -> { solved, score, timeTaken... }
    isLoading: true,
    isInitialized: false,
    initError: null,

    /**
     * Load streak data from IndexedDB.
     * Merges legacy 'streaks' data with new 'dailyActivity' data.
     */
    initialize: async () => {
        // Prevent double-init when already loaded
        const state = get();
        if (state.isInitialized) return;

        set({ isLoading: true, initError: null });
        try {
            // ------- Read new dailyActivity store -------
            let newEntries = [];
            try {
                newEntries = await activityStorage.getAll();
            } catch (e) {
                console.warn('dailyActivity store read failed (may not exist yet):', e);
            }

            // ------- Read legacy streaks store -------
            let legacyEntries = [];
            try {
                legacyEntries = await streakStorage.getAll();
            } catch (e) {
                console.warn('streaks store read failed:', e);
            }

            // ------- Merge into activityMap -------
            const activityMap = {};
            let totalScore = 0;

            // Legacy entries first (they'll be overwritten by newer data if overlapping)
            for (const entry of legacyEntries) {
                if (entry.date && entry.puzzlesCompleted > 0) {
                    activityMap[entry.date] = {
                        date: entry.date,
                        solved: true,
                        score: entry.totalScore || 0,
                        timeTaken: 0,
                        difficulty: 1,
                        synced: false,
                    };
                    totalScore += entry.totalScore || 0;
                }
            }

            // New entries overwrite legacy
            for (const entry of newEntries) {
                activityMap[entry.date] = entry;
                // Recalculate total to avoid double-counting
            }

            // Recalculate totalScore from merged map
            totalScore = 0;
            for (const entry of Object.values(activityMap)) {
                if (entry.score) totalScore += entry.score;
            }

            const currentStreak = calculateStreak(activityMap);
            const longestStreak = calculateLongestStreak(activityMap);

            // Find last played date
            const dates = Object.keys(activityMap).sort();
            const lastPlayedDate = dates.length > 0 ? dates[dates.length - 1] : null;

            set({
                currentStreak,
                longestStreak,
                lastPlayedDate,
                activityMap,
                totalScore,
                isLoading: false,
                isInitialized: true,
                initError: null,
            });
        } catch (error) {
            console.error('Failed to initialize streak store:', error);
            set({ isLoading: false, initError: error.message });
        }
    },

    /**
     * Record a puzzle completion for today.
     * @param {Object} diff - { score, timeTaken, difficulty }
     */
    recordCompletion: async ({ score, timeTaken, difficulty }) => {
        const today = getTodayISO();
        const state = get();

        // Default entry structure
        const entry = {
            date: today,
            solved: true,
            score,
            timeTaken,
            difficulty,
            synced: false,
            timestamp: Date.now(),
        };

        // Optimistic update
        const newMap = { ...state.activityMap, [today]: entry };
        const newStreak = calculateStreak(newMap);
        const newLongest = Math.max(state.longestStreak, newStreak);
        const newTotal = state.totalScore + score;

        set({
            activityMap: newMap,
            currentStreak: newStreak,
            longestStreak: newLongest,
            totalScore: newTotal,
            lastPlayedDate: today,
        });

        // Async persist to BOTH stores for backward compat
        try {
            await activityStorage.put(entry);
            await streakStorage.put({
                date: today,
                puzzlesCompleted: 1,
                totalScore: score,
            });
        } catch (e) {
            console.error('Failed to persist completion:', e);
        }
    },

    /**
     * Get processed heatmap data for rendering
     * @returns {Object} Map of date -> intensity/level (0-4)
     */
    getHeatmapIntensity: () => {
        const { activityMap } = get();
        const intensityMap = {};

        Object.values(activityMap).forEach((entry) => {
            if (!entry.solved) return;

            let level = 1;
            if (entry.score > 300) level = 4;
            else if (entry.score > 200) level = 3;
            else if (entry.score > 100) level = 2;

            intensityMap[entry.date] = level;
        });

        return intensityMap;
    },
}));
