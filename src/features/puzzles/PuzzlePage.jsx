/**
 * PuzzlePage.jsx — Main gameplay page
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PUZZLE_TYPES = ['logic', 'math', 'pattern', 'sequence', 'memory'];

export default function PuzzlePage() {
    const navigate = useNavigate();
    const [puzzles, setPuzzles] = useState([]);
    const [activeType, setActiveType] = useState('logic');
    const [completedPuzzles, setCompletedPuzzles] = useState(new Set());
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const initStreak = useStreakStore((s) => s.initialize);
    const recordStreakCompletion = useStreakStore((s) => s.recordCompletion);
    const { recordScore, loadTodayScores } = useScoreStore();

    useEffect(() => {
        async function load() {
            try {
                const todayPuzzles = await getTodayPuzzles();
                setPuzzles(todayPuzzles);

                const doneSet = new Set();
                for (const p of todayPuzzles) {
                    const progress = await getPuzzleProgress(p.id);
                    if (progress?.completed) doneSet.add(p.id);
                }
                setCompletedPuzzles(doneSet);

                await initStreak();
                await loadTodayScores(getTodayDateStr());
            } catch (error) {
                console.error('PuzzlePage: load failed', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []); // initStreak and loadTodayScores are stable Zustand refs

    const activePuzzle = useMemo(() => puzzles.find((p) => p.type === activeType), [puzzles, activeType]);
    const allCompleted = useMemo(() => puzzles.length > 0 && puzzles.every((p) => completedPuzzles.has(p.id)), [puzzles, completedPuzzles]);

    const handleSubmit = useCallback(
        async (puzzle, answer, timeTaken, hintsUsed) => {
            try {
                const validationResult = await submitAnswer(puzzle, {
                    puzzleId: puzzle.id,
                    answer,
                    timeTaken,
                    hintsUsed,
                });

                if (validationResult.correct) {
                    const newSet = new Set(completedPuzzles);
                    newSet.add(puzzle.id);
                    setCompletedPuzzles(newSet);

                    recordScore(puzzle.id, validationResult.score);
                    await recordStreakCompletion({
                        score: validationResult.score || 0,
                        timeTaken: timeTaken || 0,
                        difficulty: puzzle.difficulty || 1,
                    });
                    await recordCompletion();

                    track('puzzle_completed', {
                        puzzleType: puzzle.type,
                        score: validationResult.score,
                    });
                }

                setResult(validationResult);
            } catch (err) {
                console.error('Submit failed:', err);
            }
        },
        [completedPuzzles, recordScore, recordStreakCompletion]
    );

    const handleMenu = useCallback(() => {
        setResult(null);
    }, []);

    const handleNextPuzzle = useCallback(() => {
        setResult(null);

        // Find next uncompleted puzzle starting from current
        const currentIdx = PUZZLE_TYPES.indexOf(activeType);

        for (let i = 1; i < 5; i++) {
            const nextType = PUZZLE_TYPES[(currentIdx + i) % 5];
            const nextPuzzle = puzzles.find((p) => p.type === nextType);
            if (nextPuzzle && !completedPuzzles.has(nextPuzzle.id)) {
                setActiveType(nextType);
                return;
            }
        }

        // Final check: if the CURRENT one is now completed and we found no others
        const currentPuzzle = puzzles.find((p) => p.type === activeType);
        if (currentPuzzle && completedPuzzles.has(currentPuzzle.id)) {
            navigate('/stats');
        }
    }, [activeType, puzzles, completedPuzzles, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360, opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl"
                >
                    🧩
                </motion.div>
                <div className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">
                    Synching Neural Network...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <header className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white">CHALLENGES</h2>
                    <p className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.3em] mt-1">
                        Deployment Phase {new Date().getDate()}
                    </p>
                </div>
                {allCompleted && (
                    <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">All Clear</span>
                    </div>
                )}
            </header>

            <div className="p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 flex gap-1 overflow-x-auto no-scrollbar">
                {PUZZLE_TYPES.map((type) => {
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
                                    ? 'text-brand-400 hover:text-brand-300'
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <ScoreDisplay
                            result={result}
                            onNext={handleNextPuzzle}
                            onMenu={handleMenu}
                        />
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
                            onSubmit={handleSubmit}
                        />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
