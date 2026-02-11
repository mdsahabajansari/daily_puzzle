/**
 * tests/setup.js — Test environment setup
 */

import '@testing-library/jest-dom';

const mockIDB = {
    open: () =>
        Promise.resolve({
            get: () => Promise.resolve(undefined),
            put: () => Promise.resolve(),
            delete: () => Promise.resolve(),
            getAll: () => Promise.resolve([]),
            clear: () => Promise.resolve(),
            count: () => Promise.resolve(0),
        }),
};

globalThis.indexedDB = globalThis.indexedDB || mockIDB;
