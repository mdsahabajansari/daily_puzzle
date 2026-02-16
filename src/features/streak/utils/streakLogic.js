/**
 * streakLogic.js — Pure functions for streak calculation
 */
import dayjs from 'dayjs';

/**
 * Calculate the current streak based on activity history.
 * 
 * @param {Object} activityMap - Map of 'YYYY-MM-DD' -> { solved: boolean }
 * @returns {number} Current streak count
 */
export function calculateStreak(activityMap) {
    let count = 0;
    let ptr = dayjs();

    // Check today
    if (activityMap[ptr.format('YYYY-MM-DD')]?.solved) {
        count++;
        ptr = ptr.subtract(1, 'day');
    } else {
        // Check yesterday (grace period)
        const yesterday = ptr.subtract(1, 'day');
        if (activityMap[yesterday.format('YYYY-MM-DD')]?.solved) {
            count++; // The streak is alive from yesterday
            ptr = ptr.subtract(2, 'day');
        } else {
            return 0; // Streak broken
        }
    }

    // Count backwards
    while (activityMap[ptr.format('YYYY-MM-DD')]?.solved) {
        count++;
        ptr = ptr.subtract(1, 'day');
    }

    return count;
}

/**
 * Calculate Longest Streak
 */
export function calculateLongestStreak(activityMap) {
    const dates = Object.keys(activityMap).filter(d => activityMap[d]?.solved).sort();
    if (dates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
        const current = dayjs(dates[i]);
        const next = dayjs(dates[i + 1]);

        if (next.diff(current, 'day') === 1) {
            currentStreak++;
        } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }

    return Math.max(maxStreak, currentStreak);
}
