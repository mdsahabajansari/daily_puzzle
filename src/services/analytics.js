/**
 * analytics.js — Lightweight event tracking
 */

const eventQueue = [];
const FLUSH_INTERVAL = 30_000;
const MAX_QUEUE_SIZE = 50;

export function track(name, properties = {}) {
    eventQueue.push({
        name,
        properties,
        timestamp: Date.now(),
    });

    if (eventQueue.length >= MAX_QUEUE_SIZE) {
        flushEvents();
    }
}

async function flushEvents() {
    if (eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue.length = 0;

    try {
        const apiBase = import.meta.env.VITE_APP_URL || '';
        await fetch(`${apiBase}/api/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events }),
            keepalive: true,
        });
    } catch {
        eventQueue.push(...events);
    }
}

export function initAnalytics() {
    setInterval(flushEvents, FLUSH_INTERVAL);

    window.addEventListener('beforeunload', () => {
        flushEvents();
    });

    track('app_opened', {
        isOffline: !navigator.onLine,
        timestamp: Date.now(),
    });
}
