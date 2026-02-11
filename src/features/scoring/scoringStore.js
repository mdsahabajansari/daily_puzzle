/**
 * scoringStore.js — Score calculation and tracking
 */

import { create } from 'zustand';
import { progressStorage } from '@/storage/indexedDB';

export const useScoreStore = create((set, get) => ({
    todayScores: {},
    todayTotal: 0,
    bestScore: 0,

    recordScore: (puzzleId, score) => {
        const state = get();
        const currentBest = state.todayScores[puzzleId] || 0;

        if (score > currentBest) {
            const newScores = { ...state.todayScores, [puzzleId]: score };
            const newTotal = Object.values(newScores).reduce((sum, s) => sum + s, 0);
            const newBest = Math.max(state.bestScore, score);

            set({
                todayScores: newScores,
                todayTotal: newTotal,
                bestScore: newBest,
            });
        }
    },

    loadTodayScores: async (dateStr) => {
        const allProgress = await progressStorage.getAll();
        const todayProgress = allProgress.filter((p) => p.puzzleId.startsWith(dateStr));

        const todayScores = {};
        let bestScore = 0;

        for (const p of todayProgress) {
            todayScores[p.puzzleId] = p.score;
            bestScore = Math.max(bestScore, p.score);
        }

        const todayTotal = Object.values(todayScores).reduce((sum, s) => sum + s, 0);

        set({ todayScores, todayTotal, bestScore });
    },
}));

/**
 * Calculate the final score for a puzzle completion.
 */
export function calculateScore(params) {
    const { maxScore, timeTaken, timeLimit, hintsUsed, streak } = params;

    const speedRatio = timeLimit > 0 ? Math.max(0, (timeLimit - timeTaken) / timeLimit) : 0;
    const speedBonus = Math.round(speedRatio * 0.3 * maxScore);

    const hintPenalty = Math.round(hintsUsed * 0.15 * maxScore);

    const streakMultiplier = 1 + Math.min(streak * 0.05, 0.5);

    const rawScore = maxScore + speedBonus - hintPenalty;
    const finalScore = Math.max(10, Math.round(rawScore * streakMultiplier));

    return finalScore;
}
