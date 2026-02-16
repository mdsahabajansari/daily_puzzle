/**
 * sync.js — Real Firestore sync for daily activities
 *
 * Syncs unsynced IndexedDB entries to Firestore.
 * Collection: users/{uid}/dailyScores/{date}
 */

import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { activityStorage } from '../storage/indexedDB';
import { getCurrentUser } from './authService';

let db = null;

function getDb() {
    if (!db) {
        db = getFirestore();
    }
    return db;
}

/**
 * Sync unsynced daily activities to Firestore.
 * Only syncs if the user is logged in.
 */
export async function syncDailyScores() {
    const user = getCurrentUser();
    if (!user) {
        return { count: 0, status: 'guest-mode' };
    }

    // 1. Get all unsynced entries from IndexedDB
    const all = await activityStorage.getAll();
    const unsynced = all.filter(item => !item.synced);

    if (unsynced.length === 0) {
        return { count: 0, status: 'idle' };
    }

    try {
        const firestore = getDb();

        // 2. Write each unsynced entry to Firestore
        for (const item of unsynced) {
            // Validate the entry before syncing
            if (!item.date || typeof item.date !== 'string') continue;

            // Security: reject future dates
            const entryDate = new Date(item.date);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            if (entryDate >= tomorrow) {
                console.warn('[Sync] Rejecting future date:', item.date);
                continue;
            }

            // Security: reject invalid score range (0-500)
            const score = Number(item.score) || 0;
            if (score < 0 || score > 500) {
                console.warn('[Sync] Rejecting invalid score:', score);
                continue;
            }

            const docRef = doc(firestore, 'users', user.uid, 'dailyScores', item.date);
            await setDoc(docRef, {
                date: item.date,
                score: score,
                puzzlesCompleted: item.puzzlesCompleted || 1,
                timeTaken: item.timeTaken || 0,
                difficulty: item.difficulty || 1,
                solved: item.solved ?? true,
                syncedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true }); // merge: true = upsert behavior

            // 3. Mark as synced locally
            item.synced = true;
            await activityStorage.put(item);
        }

        console.log(`[Sync] ✅ Synced ${unsynced.length} entries to Firestore`);
        return { count: unsynced.length, status: 'success' };

    } catch (error) {
        console.error('[Sync] ❌ Failed to sync:', error);
        return { count: 0, status: 'error', error };
    }
}

/**
 * Pull cloud data into local IndexedDB (e.g. on new device login).
 */
export async function pullFromCloud() {
    const user = getCurrentUser();
    if (!user) return { count: 0, status: 'guest-mode' };

    try {
        const firestore = getDb();
        const colRef = collection(firestore, 'users', user.uid, 'dailyScores');
        const snapshot = await getDocs(colRef);

        let imported = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const existing = await activityStorage.get(data.date);

            // Only import if we don't have this date locally
            if (!existing) {
                await activityStorage.put({
                    date: data.date,
                    score: data.score || 0,
                    puzzlesCompleted: data.puzzlesCompleted || 1,
                    timeTaken: data.timeTaken || 0,
                    difficulty: data.difficulty || 1,
                    solved: data.solved ?? true,
                    synced: true,
                });
                imported++;
            }
        }

        console.log(`[Sync] ☁️ Pulled ${imported} entries from Firestore`);
        return { count: imported, status: 'success' };

    } catch (error) {
        console.error('[Sync] Pull from cloud failed:', error);
        return { count: 0, status: 'error', error };
    }
}

/**
 * Count how many entries are not yet synced.
 */
export async function getUnsyncedCount() {
    try {
        const all = await activityStorage.getAll();
        return all.filter(item => !item.synced).length;
    } catch (e) {
        return 0;
    }
}
