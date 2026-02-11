/**
 * streak.test.js — Unit tests for streak logic
 */

import { describe, it, expect } from 'vitest';
import { isConsecutiveDay, isSameDay, daysBetween, formatDate, getDateRange } from '@/utils/dateUtils';

describe('Streak Logic — Date Utilities', () => {
    it('isSameDay should correctly compare dates', () => {
        expect(isSameDay('2026-02-11', '2026-02-11')).toBe(true);
        expect(isSameDay('2026-02-11', '2026-02-12')).toBe(false);
    });

    it('isConsecutiveDay should detect adjacent days', () => {
        expect(isConsecutiveDay('2026-02-10', '2026-02-11')).toBe(true);
        expect(isConsecutiveDay('2026-02-11', '2026-02-12')).toBe(true);
        expect(isConsecutiveDay('2026-01-31', '2026-02-01')).toBe(true);
        expect(isConsecutiveDay('2025-12-31', '2026-01-01')).toBe(true);
    });

    it('isConsecutiveDay should reject non-adjacent days', () => {
        expect(isConsecutiveDay('2026-02-10', '2026-02-12')).toBe(false);
        expect(isConsecutiveDay('2026-02-11', '2026-02-11')).toBe(false);
    });

    it('daysBetween should calculate correct gaps', () => {
        expect(daysBetween('2026-02-10', '2026-02-11')).toBe(1);
        expect(daysBetween('2026-02-11', '2026-02-11')).toBe(0);
        expect(daysBetween('2026-01-01', '2026-01-31')).toBe(30);
    });

    it('formatDate should return YYYY-MM-DD', () => {
        const date = new Date(2026, 1, 11);
        expect(formatDate(date)).toBe('2026-02-11');
    });

    it('formatDate should zero-pad single-digit months and days', () => {
        const date = new Date(2026, 0, 5);
        expect(formatDate(date)).toBe('2026-01-05');
    });

    it('getDateRange should return inclusive range', () => {
        const range = getDateRange('2026-02-10', '2026-02-12');
        expect(range).toEqual(['2026-02-10', '2026-02-11', '2026-02-12']);
    });

    it('getDateRange should handle single day', () => {
        const range = getDateRange('2026-02-11', '2026-02-11');
        expect(range).toEqual(['2026-02-11']);
    });

    it('should calculate streak by walking backwards from today', () => {
        const history = {
            '2026-02-09': 3,
            '2026-02-10': 5,
            '2026-02-11': 2,
        };

        let streak = 0;
        let checkDate = new Date('2026-02-11');

        while (true) {
            const dateStr = formatDate(checkDate);
            if (history[dateStr] && history[dateStr] > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        expect(streak).toBe(3);
    });

    it('should reset streak when a day is missed', () => {
        const history = {
            '2026-02-09': 3,
            '2026-02-11': 2,
        };

        let streak = 0;
        let checkDate = new Date('2026-02-11');

        while (true) {
            const dateStr = formatDate(checkDate);
            if (history[dateStr] && history[dateStr] > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        expect(streak).toBe(1);
    });

    it('should handle empty history (streak = 0)', () => {
        const history = {};

        let streak = 0;
        const checkDate = new Date('2026-02-11');
        const dateStr = formatDate(checkDate);

        if (history[dateStr] && history[dateStr] > 0) {
            streak++;
        }

        expect(streak).toBe(0);
    });
});
