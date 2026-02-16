/**
 * dateUtils.js — Date manipulation helpers for the Heatmap
 */
import dayjs from 'dayjs';

/**
 * Generate a grid of days for the heatmap (last 365 days or current year).
 * We align to weeks (columns) starting from Sunday (or Monday based on locale).
 *
 * @param {number} daysCount - Number of days to look back
 * @returns {Array<Array<{date: string, isPadding: boolean}>>} - 2D array of weeks
 */
export function generateDateGrid(daysCount = 365) {
    const today = dayjs();
    const startDate = today.subtract(daysCount, 'day');

    // Adjust start date to the beginning of that week to align grid
    const startOfWeek = startDate.startOf('week');

    const weeks = [];
    let currentWeek = [];
    let currentDate = startOfWeek;

    // We generate enough weeks to cover until today
    while (currentDate.isBefore(today) || currentDate.isSame(today, 'day')) {
        currentWeek.push({
            date: currentDate.format('YYYY-MM-DD'),
            isPadding: false
        });

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        currentDate = currentDate.add(1, 'day');
    }

    // Fill remaining days in the last week
    if (currentWeek.length > 0) {
        // Pad with future dates or empty placeholders if needed, 
        // but typically we just stop or fill with today + 1...
        // For heatmap, we usually want full columns.
        while (currentWeek.length < 7) {
            currentWeek.push({ date: currentDate.format('YYYY-MM-DD'), isPadding: true });
            currentDate = currentDate.add(1, 'day');
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

/**
 * Format a date for display
 */
export function formatTooltipDate(dateStr) {
    if (!dateStr) return '';
    return dayjs(dateStr).format('MMM D, YYYY');
}

/**
 * Get standard ISO date string
 */
export function getTodayISO() {
    return dayjs().format('YYYY-MM-DD');
}
