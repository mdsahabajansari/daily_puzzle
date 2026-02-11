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
 */
export function AuthProvider({ children }) {
    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            useAuthStore.getState().setUser(user);
        });

        return unsubscribe;
    }, []);

    return <>{children}</>;
}
