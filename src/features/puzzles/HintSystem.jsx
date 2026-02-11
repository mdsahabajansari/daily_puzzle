/**
 * HintSystem.jsx — Progressive hint reveal
 */

import { motion, AnimatePresence } from 'framer-motion';

export default function HintSystem({ hints, hintsUsed, onUseHint }) {
    const canUseHint = hintsUsed < hints.length;

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {hints.slice(0, hintsUsed).map((hint, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                    >
                        <span className="text-amber-400 text-sm mt-0.5">💡</span>
                        <span className="text-amber-200 text-sm">{hint}</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {canUseHint && (
                <button
                    onClick={onUseHint}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors"
                >
                    <span>💡</span>
                    Use Hint ({hintsUsed}/{hints.length}) — costs 15% score
                </button>
            )}

            {!canUseHint && hintsUsed > 0 && (
                <p className="text-xs text-slate-600">All hints used</p>
            )}
        </div>
    );
}
