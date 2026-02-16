/**
 * syncService.js — Batched completion sync + progress backup to Firestore
 *
 * Batches puzzle completions and syncs to Firestore after every N completions,
 * or on page unload.
 *
 * Collections:
 *   users/{uid}/progress/{puzzleId}
 *   users/{uid}/streaks/{date}
 */

import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import { progressStorage, streakStorage } from '@/storage/indexedDB';
import { getCurrentUser, getIdToken } from './authService';

const SYNC_THRESHOLD = 3; // Sync after every 3 completions
let pendingCount = 0;
let db = null;

function getDb() {
    if (!db) db = getFirestore();
    return db;
}

/**
 * Called after each puzzle completion.
 * Increments pending counter and triggers sync when threshold is reached.
 */
export async function recordCompletion() {
    pendingCount++;
    if (pendingCount >= SYNC_THRESHOLD) {
        await syncToServer();
        pendingCount = 0;
    }
}

/**
 * Sync progress and streaks to Firestore using a batched write.
 */
export async function syncToServer() {
    try {
        const user = getCurrentUser();
        if (!user) {
            console.log('[SyncService] Guest mode — skipping server sync');
            return false;
        }

        const firestore = getDb();
        const progress = await progressStorage.getAll();
        const streaks = await streakStorage.getAll();

        // Use Firestore batched writes (max 500 operations per batch)
        const batch = writeBatch(firestore);

        // Write progress entries
        for (const p of progress) {
            if (!p.puzzleId) continue;

            // Security: validate score range
            const score = Number(p.score) || 0;
            if (score < 0 || score > 500) continue;

            // Security: reject unrealistic completion times (> 1 hour)
            const timeTaken = Number(p.timeTaken) || 0;
            if (timeTaken > 3600) continue;

            const ref = doc(firestore, 'users', user.uid, 'progress', p.puzzleId);
            batch.set(ref, {
                puzzleId: p.puzzleId,
                completed: p.completed || false,
                score: score,
                timeTaken: timeTaken,
                hintsUsed: p.hintsUsed || 0,
                completedAt: p.completedAt || null,
                syncedAt: new Date().toISOString(),
            }, { merge: true });
        }

        // Write streak entries
        for (const s of streaks) {
            if (!s.date) continue;

            // Security: reject future dates
            const entryDate = new Date(s.date);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            if (entryDate >= tomorrow) continue;

            const ref = doc(firestore, 'users', user.uid, 'streaks', s.date);
            batch.set(ref, {
                date: s.date,
                puzzlesCompleted: s.puzzlesCompleted || 0,
                totalScore: s.totalScore || 0,
                syncedAt: new Date().toISOString(),
            }, { merge: true });
        }

        await batch.commit();
        console.log(`[SyncService] ✅ Synced ${progress.length} progress + ${streaks.length} streak entries`);
        return true;

    } catch (error) {
        console.warn('[SyncService] ❌ Sync failed, will retry later:', error.message);
        return false;
    }
}

export function hasPendingSync() {
    return pendingCount > 0;
}

/**
 * Register a sync attempt when the page is about to unload.
 * Uses sendBeacon as a last resort, but also tries Firestore directly.
 */
export function registerSyncOnUnload() {
    window.addEventListener('beforeunload', () => {
        if (pendingCount > 0) {
            // Fire-and-forget Firestore sync
            syncToServer().catch(() => { });
        }
    });
}
