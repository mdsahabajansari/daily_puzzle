/**
 * utils/dateUtils.js — Date manipulation helpers
 */

/**
 * Format a Date object as YYYY-MM-DD.
 */
export function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getToday() {
    return formatDate(new Date());
}

/**
 * Get yesterday's date as YYYY-MM-DD.
 */
export function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
}

/**
 * Check if two date strings represent the same day.
 */
export function isSameDay(a, b) {
    return a === b;
}

/**
 * Check if date A is exactly one day before date B.
 */
export function isConsecutiveDay(earlier, later) {
    const a = new Date(earlier);
    const b = new Date(later);
    const diffMs = b.getTime() - a.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    return diffDays === 1;
}

/**
 * Get the number of days between two dates.
 */
export function daysBetween(a, b) {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return Math.abs(Math.round((dateB.getTime() - dateA.getTime()) / 86400000));
}

/**
 * Get an array of dates from start to end (inclusive).
 */
export function getDateRange(start, end) {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Check if a date is in the past (before today).
 */
export function isPast(dateStr) {
    return dateStr < getToday();
}

/**
 * Check if a date is today.
 */
export function isToday(dateStr) {
    return dateStr === getToday();
}
