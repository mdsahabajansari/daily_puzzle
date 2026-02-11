/**
 * streakStore.js — Streak tracking with Zustand
 */

import { create } from 'zustand';
import { streakStorage } from '@/storage/indexedDB';
import { getTodayDateStr } from '@/engine/generator';

export const useStreakStore = create((set, get) => ({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    history: {},
    totalScore: 0,

    /**
     * Load streak data from IndexedDB.
     */
    initialize: async () => {
        const entries = await streakStorage.getAll();
        const history = {};
        let totalScore = 0;

        for (const entry of entries) {
            history[entry.date] = entry.puzzlesCompleted;
            totalScore += entry.totalScore;
        }

        const today = getTodayDateStr();
        let streak = 0;
        let checkDate = new Date(today);

        while (true) {
            const dateStr = formatDate(checkDate);
            if (history[dateStr] && history[dateStr] > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        let longestStreak = streak;
        let tempStreak = 0;
        const allDates = Object.keys(history).sort();

        for (let i = 0; i < allDates.length; i++) {
            if (history[allDates[i]] > 0) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }

            if (i < allDates.length - 1) {
                const current = new Date(allDates[i]);
                const next = new Date(allDates[i + 1]);
                const diffDays = (next.getTime() - current.getTime()) / 86400000;
                if (diffDays > 1) {
                    tempStreak = 0;
                }
            }
        }

        const lastPlayedDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;

        set({ currentStreak: streak, longestStreak, lastPlayedDate, history, totalScore });
    },

    /**
     * Record a puzzle completion for today.
     */
    recordCompletion: async (score) => {
        const today = getTodayDateStr();
        const state = get();

        const newCount = (state.history[today] || 0) + 1;
        const newHistory = { ...state.history, [today]: newCount };

        let newStreak = state.currentStreak;
        if (state.lastPlayedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = formatDate(yesterday);

            if (state.lastPlayedDate === yesterdayStr || state.currentStreak === 0) {
                newStreak = state.currentStreak + 1;
            } else {
                newStreak = 1;
            }
        }

        const newLongest = Math.max(state.longestStreak, newStreak);
        const newTotal = state.totalScore + score;

        const existing = await streakStorage.get(today);
        await streakStorage.put({
            date: today,
            puzzlesCompleted: newCount,
            totalScore: (existing?.totalScore || 0) + score,
        });

        set({
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastPlayedDate: today,
            history: newHistory,
            totalScore: newTotal,
        });
    },

    /**
     * Generate heatmap data for the last N days.
     */
    getHeatmapData: (days) => {
        const state = get();
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = formatDate(d);
            data.push({
                date: dateStr,
                count: state.history[dateStr] || 0,
            });
        }

        return data;
    },
}));

/** Format a Date as YYYY-MM-DD */
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
