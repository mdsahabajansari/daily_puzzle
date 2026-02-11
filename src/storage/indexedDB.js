/**
 * indexedDB.js — Local database layer using idb
 */

import { openDB } from 'idb';

const DB_NAME = 'daily-puzzle-db';
const DB_VERSION = 1;

/** Cached DB instance */
let dbInstance = null;

/**
 * Opens (or creates) the IndexedDB database.
 */
async function getDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('puzzles')) {
                db.createObjectStore('puzzles', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress', { keyPath: 'puzzleId' });
            }
            if (!db.objectStoreNames.contains('streaks')) {
                db.createObjectStore('streaks', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        },
    });

    return dbInstance;
}

/**
 * Creates a storage helper for a specific object store.
 */
function createStore(storeName) {
    return {
        async get(key) {
            const db = await getDB();
            return db.get(storeName, key);
        },

        async put(value) {
            const db = await getDB();
            await db.put(storeName, value);
        },

        async delete(key) {
            const db = await getDB();
            await db.delete(storeName, key);
        },

        async getAll() {
            const db = await getDB();
            return db.getAll(storeName);
        },

        async clear() {
            const db = await getDB();
            await db.clear(storeName);
        },

        async count() {
            const db = await getDB();
            return db.count(storeName);
        },
    };
}

export const puzzleStorage = createStore('puzzles');
export const progressStorage = createStore('progress');
export const streakStorage = createStore('streaks');
export const settingsStorage = createStore('settings');
