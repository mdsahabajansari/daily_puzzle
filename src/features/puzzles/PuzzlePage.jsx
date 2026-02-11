/**
 * PuzzlePage.jsx — Main gameplay page
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayPuzzles, submitAnswer, getPuzzleProgress } from '@/engine/puzzleEngine';
import { getTodayDateStr } from '@/engine/generator';
import { useStreakStore } from '@/features/streak/streakStore';
import { useScoreStore } from '@/features/scoring/scoringStore';
import { recordCompletion } from '@/services/syncService';
import { track } from '@/services/analytics';
import PuzzleCard from './PuzzleCard';
import ScoreDisplay from '@/features/scoring/ScoreDisplay';

const TYPE_ICONS = {
    logic: '🧠',
    math: '🔢',
    pattern: '🔲',
    sequence: '📈',
    memory: '🃏',
};

const TYPE_LABELS = {
    logic: 'Logic',
    math: 'Math',
    pattern: 'Pattern',
    sequence: 'Sequence',
    memory: 'Memory',
};

export default function PuzzlePage() {
    const [puzzles, setPuzzles] = useState([]);
    const [activeType, setActiveType] = useState('logic');
    const [completedPuzzles, setCompletedPuzzles] = useState(new Set());
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const { initialize: initStreak, recordCompletion: recordStreakCompletion } = useStreakStore();
    const { recordScore, loadTodayScores } = useScoreStore();

    useEffect(() => {
        async function load() {
            try {
                const todayPuzzles = await getTodayPuzzles();
                setPuzzles(todayPuzzles);

                const done = new Set();
                for (const p of todayPuzzles) {
                    const progress = await getPuzzleProgress(p.id);
                    if (progress?.completed) done.add(p.id);
                }
                setCompletedPuzzles(done);

                await initStreak();
                await loadTodayScores(getTodayDateStr());
            } catch (error) {
                console.error('Failed to load puzzles:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [initStreak, loadTodayScores]);

    const handleSubmit = useCallback(
        async (puzzle, answer, timeTaken, hintsUsed) => {
            const validationResult = await submitAnswer(puzzle, {
                puzzleId: puzzle.id,
                answer,
                timeTaken,
                hintsUsed,
            });

            setResult(validationResult);

            if (validationResult.correct) {
                setCompletedPuzzles((prev) => new Set([...prev, puzzle.id]));
                recordScore(puzzle.id, validationResult.score);
                await recordStreakCompletion(validationResult.score);
                await recordCompletion();

                track('puzzle_completed', {
                    puzzleType: puzzle.type,
                    score: validationResult.score,
                    timeTaken,
                    hintsUsed,
                    difficulty: puzzle.difficulty,
                });
            }
        },
        [recordScore, recordStreakCompletion],
    );

    const handleNextPuzzle = useCallback(() => {
        setResult(null);
        const types = ['logic', 'math', 'pattern', 'sequence', 'memory'];
        const currentIdx = types.indexOf(activeType);
        for (let i = 1; i <= 5; i++) {
            const nextType = types[(currentIdx + i) % 5];
            const nextPuzzle = puzzles.find((p) => p.type === nextType);
            if (nextPuzzle && !completedPuzzles.has(nextPuzzle.id)) {
                setActiveType(nextType);
                return;
            }
        }
    }, [activeType, puzzles, completedPuzzles]);

    const activePuzzle = puzzles.find((p) => p.type === activeType);
    const allCompleted = puzzles.length > 0 && puzzles.every((p) => completedPuzzles.has(p.id));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-6xl"
                >
                    🧩
                </motion.div>
                <div className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">
                    Generating Puzzles...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white">CHALLENGES</h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-[0.2em] mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
                {allCompleted && (
                    <div className="px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">All Clear</span>
                    </div>
                )}
            </header>

            {/* Segmented control for types */}
            <div className="p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 flex gap-1 overflow-x-auto no-scrollbar">
                {['logic', 'math', 'pattern', 'sequence', 'memory'].map((type) => {
                    const puzzle = puzzles.find((p) => p.type === type);
                    const isCompleted = puzzle ? completedPuzzles.has(puzzle.id) : false;
                    const isActive = type === activeType;

                    return (
                        <button
                            key={type}
                            onClick={() => { setActiveType(type); setResult(null); }}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                                    ? 'text-white'
                                    : isCompleted
                                        ? 'text-emerald-400 hover:text-emerald-300'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute inset-0 bg-brand-600 rounded-xl shadow-lg shadow-brand-600/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{isCompleted ? '✓' : TYPE_ICONS[type]}</span>
                            <span className="relative z-10 tracking-tight">{TYPE_LABELS[type]}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <ScoreDisplay
                            score={result.score}
                            maxScore={activePuzzle?.maxScore || 200}
                            timeTaken={result.timeTaken}
                            hintsUsed={result.hintsUsed}
                            correct={result.correct}
                        />
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={handleNextPuzzle}
                            className="w-full mt-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold transition-colors"
                        >
                            {allCompleted ? '📊 View Stats' : '➡️ Next Puzzle'}
                        </motion.button>
                    </motion.div>
                ) : activePuzzle ? (
                    <motion.div
                        key={activePuzzle.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <PuzzleCard
                            puzzle={activePuzzle}
                            completed={completedPuzzles.has(activePuzzle.id)}
                            onSubmit={handleSubmit}
                        />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
