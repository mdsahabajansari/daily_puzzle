/**
 * App.jsx — Root application component
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';

const PuzzlePage = lazy(() => import('@/features/puzzles/PuzzlePage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const StatsPage = lazy(() => import('@/features/streak/StatsPage'));

export default function App() {
    // Background Sync Listener — safe, won't crash if DB not ready
    useEffect(() => {
        let interval;
        const safeSync = async () => {
            try {
                const { syncDailyScores } = await import('@/services/sync');
                await syncDailyScores();
            } catch (e) {
                // Sync is non-critical — log and continue
                console.warn('[Sync] Background sync skipped:', e.message);
            }
        };

        // Delay initial sync to let DB upgrade finish
        const timeout = setTimeout(() => {
            safeSync();
            interval = setInterval(safeSync, 5 * 60 * 1000);
        }, 3000);

        // Sync when coming back online
        const handleOnline = () => safeSync();
        window.addEventListener('online', handleOnline);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return (
        <AuthProvider>
            <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/" element={<PuzzlePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/stats" element={<StatsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Layout>
        </AuthProvider>
    );
}
