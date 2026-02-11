/**
 * App.jsx — Root application component
 */
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';

const PuzzlePage = lazy(() => import('@/features/puzzles/PuzzlePage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const StatsPage = lazy(() => import('@/features/streak/StatsPage'));

export default function App() {
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
