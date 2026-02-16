/**
 * AuthProvider.jsx — Global authentication context
 */

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { onAuthChange } from '@/services/authService';

/**
 * Global auth store — accessible from any component.
 */
export const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user, loading: false }),
    setLoading: (loading) => set({ loading }),
}));

/**
 * AuthProvider — wraps the app to initialize auth listening.
 * When a user logs in, pull their cloud data into local IndexedDB.
 */
export function AuthProvider({ children }) {
    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            useAuthStore.getState().setUser(user);

            // On login: pull cloud data into local IndexedDB
            if (user) {
                try {
                    const { pullFromCloud } = await import('@/services/sync');
                    const result = await pullFromCloud();
                    if (result.count > 0) {
                        console.log(`[Auth] Restored ${result.count} entries from cloud`);
                    }
                } catch (e) {
                    console.warn('[Auth] Cloud pull skipped:', e.message);
                }
            }
        });

        return unsubscribe;
    }, []);

    return <>{children}</>;
}
