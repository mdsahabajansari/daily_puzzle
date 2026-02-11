import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
            <div className="relative">
                {/* Outer pulsing ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-4 bg-brand-500/20 rounded-full blur-xl"
                />

                {/* Main spinning logo */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="relative w-16 h-16 flex items-center justify-center text-4xl bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
                >
                    🧩
                </motion.div>

                {/* Satellite dots */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            rotate: 360,
                            scale: [1, 1.5, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-400 rounded-full glow-sm"
                            style={{ transform: `rotate(${angle}deg) translateY(-28px)` }}
                        />
                    </motion.div>
                ))}
            </div>

            <div className="text-center space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-500 animate-pulse">
                    Initializing
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    Preparing cognitive challenges...
                </div>
            </div>
        </div>
    );
}
