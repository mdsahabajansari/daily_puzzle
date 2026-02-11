/**
 * puzzleEngine.js — Puzzle Engine Orchestrator
 */

import { generateDailyPuzzles, getTodayDateStr, getDateRange } from './generator';
import { validateAnswer } from './validator';
import { puzzleStorage, progressStorage } from '@/storage/indexedDB';
import { compressData, decompressData } from '@/storage/compression';

const memoryCache = new Map();

/**
 * Load puzzles for a date.
 */
async function loadPuzzlesForDate(dateStr) {
    if (memoryCache.has(dateStr)) {
        return memoryCache.get(dateStr);
    }

    try {
        const cached = await puzzleStorage.get(dateStr);
        if (cached) {
            const puzzles = JSON.parse(decompressData(cached.data));
            memoryCache.set(dateStr, puzzles);
            return puzzles;
        }
    } catch {
        // Fail silently
    }

    const puzzles = generateDailyPuzzles(dateStr);
    memoryCache.set(dateStr, puzzles);

    const compressed = compressData(JSON.stringify(puzzles));
    puzzleStorage.put({ date: dateStr, data: compressed, cachedAt: new Date().toISOString() }).catch(() => { });

    return puzzles;
}

export async function getTodayPuzzles() {
    const today = getTodayDateStr();
    const puzzles = await loadPuzzlesForDate(today);
    prefetchUpcoming();
    return puzzles;
}

export async function getPuzzle(dateStr, type) {
    const puzzles = await loadPuzzlesForDate(dateStr);
    return puzzles.find((p) => p.type === type);
}

export async function submitAnswer(puzzle, input) {
    const result = validateAnswer(puzzle, input);

    const progress = {
        puzzleId: puzzle.id,
        completed: result.correct,
        score: result.score,
        timeTaken: result.timeTaken,
        hintsUsed: result.hintsUsed,
        completedAt: result.correct ? new Date().toISOString() : null,
    };

    await progressStorage.put(progress);
    return result;
}

export async function getPuzzleProgress(puzzleId) {
    return progressStorage.get(puzzleId);
}

export async function getDateProgress(dateStr) {
    const all = await progressStorage.getAll();
    return all.filter((p) => p.puzzleId.startsWith(dateStr));
}

async function prefetchUpcoming() {
    const dates = getDateRange(1, 7);
    for (const date of dates) {
        const existing = await puzzleStorage.get(date).catch(() => null);
        if (!existing) {
            await loadPuzzlesForDate(date);
        }
    }
}

export async function cleanupOldPuzzles() {
    const allPuzzles = await puzzleStorage.getAll();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

    for (const entry of allPuzzles) {
        if (entry.date < cutoff) {
            await puzzleStorage.delete(entry.date);
        }
    }
}
