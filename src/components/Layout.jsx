/**
 * Layout.jsx — Persistent app shell
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col selection:bg-brand-500/30">
            {/* Mesh background effect layer */}
            <div className="mesh-bg opacity-30" />

            {/* ===== Header ===== */}
            <header className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <motion.span
                            className="text-2xl"
                            whileHover={{ rotate: 20, scale: 1.2 }}
                        >
                            🧩
                        </motion.span>
                        <h1 className="text-xl font-black tracking-tight text-gradient">
                            DAILY PUZZLE
                        </h1>
                    </Link>

                    <nav className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/5">
                        <NavLink to="/" label="Play" icon="🎮" active={location.pathname === '/'} />
                        <NavLink to="/stats" label="Stats" icon="📊" active={location.pathname === '/stats'} />
                        <NavLink to="/login" label="Profile" icon="👤" active={location.pathname === '/login'} />
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 py-8 opacity-50">
                Daily Puzzle © {new Date().getFullYear()} — Train your cognitive speed
            </footer>
        </div>
    );
}

function NavLink({ to, label, icon, active }) {
    return (
        <Link
            to={to}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
        >
            <span className="relative z-10 flex items-center gap-2">
                <span className="text-sm opacity-80">{icon}</span>
                {label}
            </span>
            {active && (
                <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-brand-600/80 rounded-xl shadow-lg shadow-brand-600/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </Link>
    );
}
