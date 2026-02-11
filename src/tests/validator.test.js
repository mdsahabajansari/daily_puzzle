/**
 * validator.test.js — Unit tests for the puzzle validator
 */

import { describe, it, expect } from 'vitest';
import { validateAnswer, isValidPuzzleId } from '@/engine/validator';
import { generatePuzzle } from '@/engine/generator';

describe('Puzzle Validator', () => {
    const TEST_DATE = '2026-02-11';

    function getCorrectAnswer(puzzle) {
        return puzzle.solution;
    }

    it('should mark correct answer as correct', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');
        const answer = getCorrectAnswer(puzzle);

        const result = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 30,
            hintsUsed: 0,
        });

        expect(result.correct).toBe(true);
        expect(result.score).toBeGreaterThan(0);
    });

    it('should mark incorrect answer as incorrect with 0 score', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');

        const result = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer: -9999,
            timeTaken: 30,
            hintsUsed: 0,
        });

        expect(result.correct).toBe(false);
        expect(result.score).toBe(0);
    });

    it('should include feedback message', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');
        const answer = getCorrectAnswer(puzzle);

        const result = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 30,
            hintsUsed: 0,
        });

        expect(result.feedback).toBeTruthy();
        expect(typeof result.feedback).toBe('string');
    });

    it('should give higher score for faster completion', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');
        const answer = getCorrectAnswer(puzzle);

        const fast = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 5,
            hintsUsed: 0,
        });

        const slow = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: puzzle.timeLimit - 1,
            hintsUsed: 0,
        });

        expect(fast.score).toBeGreaterThan(slow.score);
    });

    it('should penalize hint usage', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');
        const answer = getCorrectAnswer(puzzle);

        const noHints = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 30,
            hintsUsed: 0,
        });

        const allHints = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 30,
            hintsUsed: 3,
        });

        expect(noHints.score).toBeGreaterThan(allHints.score);
    });

    it('should never give a score below 10 for correct answers', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');
        const answer = getCorrectAnswer(puzzle);

        const result = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 9999,
            hintsUsed: 3,
        });

        expect(result.correct).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(10);
    });

    it('should validate logic puzzle by option name', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'logic');
        const answer = getCorrectAnswer(puzzle);

        const result = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer,
            timeTaken: 30,
            hintsUsed: 0,
        });

        expect(result.correct).toBe(true);
    });

    it('should validate sequence puzzle by number', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'sequence');
        const answer = getCorrectAnswer(puzzle);

        const result = validateAnswer(puzzle, {
            puzzleId: puzzle.id,
            answer: Number(answer),
            timeTaken: 30,
            hintsUsed: 0,
        });

        expect(result.correct).toBe(true);
    });

    it('should validate correct puzzle ID format', () => {
        expect(isValidPuzzleId('2026-02-11-logic')).toBe(true);
        expect(isValidPuzzleId('2026-12-31-memory')).toBe(true);
    });

    it('should reject invalid puzzle ID formats', () => {
        expect(isValidPuzzleId('invalid')).toBe(false);
        expect(isValidPuzzleId('2026-02-11-unknown')).toBe(false);
        expect(isValidPuzzleId('2026-2-11-logic')).toBe(false);
    });
});
