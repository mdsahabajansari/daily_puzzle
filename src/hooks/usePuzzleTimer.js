/**
 * usePuzzleTimer.js — Custom hook for puzzle countdown timer
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage a puzzle countdown timer.
 */
export function usePuzzleTimer(timeLimit, onExpire) {
    const [elapsed, setElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef(null);
    const onExpireRef = useRef(onExpire);

    onExpireRef.current = onExpire;

    useEffect(() => {
        if (!isRunning) return;

        const startTime = Date.now() - elapsed * 1000;

        intervalRef.current = setInterval(() => {
            const newElapsed = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(newElapsed);

            if (newElapsed >= timeLimit) {
                setIsRunning(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                onExpireRef.current?.();
            }
        }, 200);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLimit, elapsed]);

    const pause = useCallback(() => setIsRunning(false), []);
    const resume = useCallback(() => setIsRunning(true), []);
    const reset = useCallback(() => {
        setElapsed(0);
        setIsRunning(true);
    }, []);

    return {
        elapsed,
        remaining: Math.max(0, timeLimit - elapsed),
        isRunning,
        isExpired: elapsed >= timeLimit,
        pause,
        resume,
        reset,
    };
}
