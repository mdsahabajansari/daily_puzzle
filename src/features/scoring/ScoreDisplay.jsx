import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreDisplay({ result, onNext }) {
    const isS = result.rating === 'S';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass overflow-hidden"
        >
            {/* Rating Banner */}
            <div className={`relative h-40 flex items-center justify-center overflow-hidden bg-brand-600`}>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600" />
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <span className={`text-8xl font-black drop-shadow-2xl ${isS ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
                        {result.rating}
                    </span>
                    <div className="absolute -top-6 -right-6 text-3xl">
                        {isS ? '👑' : '✨'}
                    </div>
                </motion.div>

                {/* Abstract background shapes */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl"
                />
            </div>

            <div className="p-10 space-y-10">
                <div className="text-center space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                        Daily Performance Log
                    </h3>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-6xl font-black text-gradient"
                    >
                        +{result.score}
                    </motion.div>
                    <p className="text-slate-400 text-sm italic mt-2 px-4 leading-relaxed">"{result.feedback}"</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <StatCard label="Time" value={`${result.timeTaken}s`} icon="⏱️" />
                    <StatCard label="Hints" value={result.hintsUsed > 0 ? `${result.hintsUsed} Used` : 'Zero'} icon="💡" />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="btn-primary w-full flex items-center justify-center gap-4 text-xl"
                >
                    <span>NEXT CHALLENGE</span>
                    <span className="opacity-70">→</span>
                </motion.button>
            </div>
        </motion.div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2 group transition-all duration-300 hover:bg-white/[0.06]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-brand-400 transition-colors">
                <span className="text-sm">{icon}</span>
                {label}
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
        </div>
    );
}
