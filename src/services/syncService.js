/**
 * syncService.js — Batched server sync service
 */

import { progressStorage, streakStorage } from '@/storage/indexedDB';
import { getIdToken } from './authService';

const SYNC_THRESHOLD = 5;
const API_BASE = import.meta.env.VITE_APP_URL || '';

let pendingCount = 0;

export async function recordCompletion() {
    pendingCount++;
    if (pendingCount >= SYNC_THRESHOLD) {
        await syncToServer();
        pendingCount = 0;
    }
}

export async function syncToServer() {
    try {
        const token = await getIdToken();
        if (!token) return false;

        const progress = await progressStorage.getAll();
        const streaks = await streakStorage.getAll();

        const response = await fetch(`${API_BASE}/api/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                progress,
                streaks,
                syncedAt: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.warn('[Sync] Failed to sync, will retry later:', error);
        return false;
    }
}

export function hasPendingSync() {
    return pendingCount > 0;
}

export function registerSyncOnUnload() {
    window.addEventListener('beforeunload', () => {
        if (pendingCount > 0) {
            const token = document.cookie;
            navigator.sendBeacon(
                `${API_BASE}/api/sync`,
                JSON.stringify({ pendingCount, timestamp: Date.now(), token }),
            );
        }
    });
}
