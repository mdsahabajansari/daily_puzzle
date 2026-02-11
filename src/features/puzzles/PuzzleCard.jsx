import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HintSystem from './HintSystem';

const TYPE_ICONS = {
    logic: '🧠',
    math: '🔢',
    pattern: '🎨',
    sequence: '📈',
    memory: '👁️',
};

const TYPE_LABELS = {
    logic: 'Logic Grid',
    math: 'Mental Math',
    pattern: 'Pattern Find',
    sequence: 'Sequence',
    memory: 'Flash Memory',
};

export default function PuzzleCard({ puzzle, onSubmit }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(puzzle.timeLimit);
    const [memoryPhase, setMemoryPhase] = useState(puzzle.type === 'memory' ? 'memorize' : 'solve');
    const timerRef = useRef(null);

    useEffect(() => {
        setSelectedAnswer(null);
        setHintsUsed(0);
        setTimeRemaining(puzzle.timeLimit);
        setMemoryPhase(puzzle.type === 'memory' ? 'memorize' : 'solve');

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [puzzle]);

    useEffect(() => {
        if (puzzle.type === 'memory' && memoryPhase === 'memorize') {
            const timer = setTimeout(() => {
                setMemoryPhase('solve');
            }, puzzle.data.displayTimeMs);
            return () => clearTimeout(timer);
        }
    }, [puzzle, memoryPhase]);

    const handleHintUsed = () => setHintsUsed((prev) => Math.min(prev + 1, 3));

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        clearInterval(timerRef.current);
        onSubmit(puzzle, selectedAnswer, puzzle.timeLimit - timeRemaining, hintsUsed);
    };

    const isTimeCritical = timeRemaining <= 10;

    return (
        <motion.div layout className="glass p-8 space-y-8">
            {/* Header: title, difficulty, timer */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">{puzzle.title}</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-3 rounded-full transition-all duration-500 ${i < puzzle.difficulty
                                            ? 'bg-brand-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]'
                                            : 'bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                            Difficulty {puzzle.difficulty}/10
                        </span>
                    </div>
                </div>

                {/* Circular Timer Visual */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-white/5"
                        />
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray="176"
                            initial={{ strokeDashoffset: 176 }}
                            animate={{ strokeDashoffset: 176 * (1 - timeRemaining / puzzle.timeLimit) }}
                            fill="transparent"
                            className={isTimeCritical ? 'text-red-500' : 'text-brand-500'}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-xs ${isTimeCritical ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                        {timeRemaining}s
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-slate-400 text-sm leading-relaxed italic">
                    "{puzzle.description}"
                </p>
            </div>

            {/* Puzzle-type-specific content */}
            <div className="py-2">
                {renderPuzzleContent(puzzle, selectedAnswer, setSelectedAnswer, memoryPhase)}
            </div>

            {/* Hints & Action */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <HintSystem hints={puzzle.hints} hintsUsed={hintsUsed} onUseHint={handleHintUsed} />

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="btn-primary w-full disabled:bg-slate-800 disabled:text-slate-500 shadow-xl"
                >
                    Validate Solution
                </motion.button>

                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-slate-600">
                    <span>Target: {puzzle.maxScore} pts</span>
                    <span>Limit: {puzzle.timeLimit}s</span>
                </div>
            </div>
        </motion.div>
    );
}

function renderPuzzleContent(puzzle, selected, onSelect, memoryPhase) {
    const { type, data } = puzzle;

    switch (type) {
        case 'logic':
            return (
                <div className="space-y-6">
                    <div className="space-y-3">
                        {data.premises.map((p, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                <span className="text-brand-500 font-bold">#0{i + 1}</span>
                                <p className="text-slate-200 text-sm">{p}</p>
                            </div>
                        ))}
                    </div>
                    <OptionGrid options={data.options} selected={selected} onSelect={(_, opt) => onSelect(opt)} />
                </div>
            );

        case 'math':
            return (
                <div className="space-y-6 text-center">
                    <div className="text-5xl font-black font-mono tracking-tighter py-6 text-white drop-shadow-md">
                        {data.expression}
                    </div>
                    <OptionGrid options={data.options} selected={selected} onSelect={(_, opt) => onSelect(opt)} />
                </div>
            );

        case 'pattern':
            return (
                <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-3 w-48 mx-auto">
                        {data.grid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold border-2 ${cell === -1
                                            ? 'bg-brand-600/20 border-brand-500/50 text-brand-400 animate-pulse'
                                            : 'bg-white/5 border-white/5 text-slate-300'
                                        }`}
                                >
                                    {cell === -1 ? '?' : cell}
                                </div>
                            )),
                        )}
                    </div>
                    <OptionGrid options={data.options} selected={selected} onSelect={(_, opt) => onSelect(opt)} />
                </div>
            );

        case 'sequence':
            return (
                <div className="space-y-8">
                    <div className="flex justify-center gap-3">
                        {data.sequence.map((num, i) => (
                            <div
                                key={i}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 ${num === null
                                        ? 'bg-brand-600/20 border-brand-500 border-dashed text-brand-500 animate-pulse'
                                        : 'bg-white/5 border-white/5 text-slate-300 shadow-inner'
                                    }`}
                            >
                                {num === null ? '?' : num}
                            </div>
                        ))}
                    </div>
                    <OptionGrid options={data.options} selected={selected} onSelect={(_, opt) => onSelect(opt)} />
                </div>
            );

        case 'memory':
            if (memoryPhase === 'memorize') {
                return (
                    <div className="space-y-6 text-center py-8">
                        <div className="text-6xl flex justify-center gap-4">
                            {data.items.map((item, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {item}
                                </motion.span>
                            ))}
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden max-w-xs mx-auto">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: data.displayTimeMs / 1000, ease: 'linear' }}
                                className="h-full bg-brand-500"
                            />
                        </div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-black">Hold focus...</p>
                    </div>
                );
            }
            return (
                <div className="space-y-8">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white mb-6">"{data.question}"</p>
                        <OptionGrid options={data.options} selected={selected} onSelect={(_, opt) => onSelect(opt)} />
                    </div>
                </div>
            );

        default:
            return null;
    }
}

function OptionGrid({ options, selected, onSelect }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {options.map((option, i) => {
                const isSelected = String(selected) === String(option);
                return (
                    <motion.button
                        key={`${option}-${i}`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(i, option)}
                        className={`relative py-4 px-6 rounded-2xl text-center font-bold transition-all duration-300 border-2 ${isSelected
                                ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                            }`}
                    >
                        {isSelected && (
                            <motion.div
                                layoutId="option-check"
                                className="absolute top-2 right-2 w-2 h-2 bg-brand-400 rounded-full glow-sm"
                            />
                        )}
                        <span className="relative z-10">{option}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
