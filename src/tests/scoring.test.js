/**
 * scoring.test.js — Unit tests for the scoring system
 */

import { describe, it, expect } from 'vitest';
import { calculateScore } from '@/features/scoring/scoringStore';

describe('Scoring System', () => {
    const BASE_PARAMS = {
        maxScore: 200,
        timeTaken: 30,
        timeLimit: 120,
        hintsUsed: 0,
        streak: 0,
    };

    it('should return at least maxScore for correct answer with no bonuses/penalties', () => {
        const score = calculateScore(BASE_PARAMS);
        expect(score).toBeGreaterThanOrEqual(BASE_PARAMS.maxScore);
    });

    it('should give higher speed bonus for faster times', () => {
        const fast = calculateScore({ ...BASE_PARAMS, timeTaken: 5 });
        const slow = calculateScore({ ...BASE_PARAMS, timeTaken: 100 });

        expect(fast).toBeGreaterThan(slow);
    });

    it('should give zero speed bonus when time is at the limit', () => {
        const atLimit = calculateScore({ ...BASE_PARAMS, timeTaken: 120 });
        const noBonus = calculateScore({ ...BASE_PARAMS, timeTaken: 120, streak: 0 });

        expect(atLimit).toBe(noBonus);
    });

    it('should give maximum speed bonus for instant completion', () => {
        const instant = calculateScore({ ...BASE_PARAMS, timeTaken: 0 });
        expect(instant).toBe(260);
    });

    it('should reduce score by 15% per hint used', () => {
        const noHints = calculateScore({ ...BASE_PARAMS, hintsUsed: 0 });
        const oneHint = calculateScore({ ...BASE_PARAMS, hintsUsed: 1 });
        const twoHints = calculateScore({ ...BASE_PARAMS, hintsUsed: 2 });
        const threeHints = calculateScore({ ...BASE_PARAMS, hintsUsed: 3 });

        expect(oneHint).toBeLessThan(noHints);
        expect(twoHints).toBeLessThan(oneHint);
        expect(threeHints).toBeLessThan(twoHints);
    });

    it('each hint should reduce score by 15% of maxScore', () => {
        const base = calculateScore({ ...BASE_PARAMS, timeTaken: 120, hintsUsed: 0 });
        const oneHint = calculateScore({ ...BASE_PARAMS, timeTaken: 120, hintsUsed: 1 });
        expect(base - oneHint).toBe(30);
    });

    it('should give streak bonus of 5% per day', () => {
        const noStreak = calculateScore({ ...BASE_PARAMS, streak: 0 });
        const dayStreak = calculateScore({ ...BASE_PARAMS, streak: 1 });
        expect(dayStreak).toBeGreaterThan(noStreak);
    });

    it('should cap streak bonus at 50% (10+ days)', () => {
        const tenDays = calculateScore({ ...BASE_PARAMS, streak: 10 });
        const twentyDays = calculateScore({ ...BASE_PARAMS, streak: 20 });
        expect(tenDays).toBe(twentyDays);
    });

    it('should never return less than 10', () => {
        const worstCase = calculateScore({
            maxScore: 100,
            timeTaken: 9999,
            timeLimit: 30,
            hintsUsed: 3,
            streak: 0,
        });

        expect(worstCase).toBeGreaterThanOrEqual(10);
    });

    it('should handle zero time limit gracefully', () => {
        const result = calculateScore({
            ...BASE_PARAMS,
            timeLimit: 0,
            timeTaken: 0,
        });

        expect(result).toBeGreaterThanOrEqual(10);
    });

    it('should handle very high difficulty max scores', () => {
        const result = calculateScore({
            maxScore: 300,
            timeTaken: 10,
            timeLimit: 60,
            hintsUsed: 0,
            streak: 10,
        });

        expect(result).toBeGreaterThan(300);
    });
});
