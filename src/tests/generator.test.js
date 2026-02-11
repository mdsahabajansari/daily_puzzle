/**
 * generator.test.js — Unit tests for the puzzle generator
 */

import { describe, it, expect } from 'vitest';
import { generateDailyPuzzles, generatePuzzle, getTodayDateStr, getDateRange } from '@/engine/generator';

describe('Puzzle Generator', () => {
    const TEST_DATE = '2026-02-11';

    it('should generate the same puzzles for the same date', () => {
        const puzzles1 = generateDailyPuzzles(TEST_DATE);
        const puzzles2 = generateDailyPuzzles(TEST_DATE);

        for (let i = 0; i < puzzles1.length; i++) {
            expect(puzzles1[i].id).toBe(puzzles2[i].id);
            expect(puzzles1[i].solution).toBe(puzzles2[i].solution);
            expect(puzzles1[i].type).toBe(puzzles2[i].type);
            expect(puzzles1[i].difficulty).toBe(puzzles2[i].difficulty);
        }
    });

    it('should generate different puzzles for different dates', () => {
        const puzzles1 = generateDailyPuzzles('2026-01-01');
        const puzzles2 = generateDailyPuzzles('2026-06-15');

        const allSame = puzzles1.every(
            (p, i) => p.solution === puzzles2[i].solution,
        );
        expect(allSame).toBe(false);
    });

    it('should generate exactly 5 puzzles', () => {
        const puzzles = generateDailyPuzzles(TEST_DATE);
        expect(puzzles).toHaveLength(5);
    });

    it('should generate one of each puzzle type', () => {
        const puzzles = generateDailyPuzzles(TEST_DATE);
        const types = puzzles.map((p) => p.type);

        expect(types).toContain('logic');
        expect(types).toContain('math');
        expect(types).toContain('pattern');
        expect(types).toContain('sequence');
        expect(types).toContain('memory');
    });

    it('should populate all required fields on each puzzle', () => {
        const puzzles = generateDailyPuzzles(TEST_DATE);

        for (const puzzle of puzzles) {
            expect(puzzle.id).toBeTruthy();
            expect(puzzle.date).toBe(TEST_DATE);
            expect(puzzle.type).toBeTruthy();
            expect(puzzle.difficulty).toBeGreaterThanOrEqual(1);
            expect(puzzle.difficulty).toBeLessThanOrEqual(10);
            expect(puzzle.title).toBeTruthy();
            expect(puzzle.description).toBeTruthy();
            expect(puzzle.hints).toHaveLength(3);
            expect(puzzle.solution).toBeDefined();
            expect(puzzle.timeLimit).toBeGreaterThan(0);
            expect(puzzle.maxScore).toBeGreaterThan(0);
        }
    });

    it('should set puzzle IDs in the format "date-type"', () => {
        const puzzles = generateDailyPuzzles(TEST_DATE);

        for (const puzzle of puzzles) {
            expect(puzzle.id).toBe(`${TEST_DATE}-${puzzle.type}`);
        }
    });

    it('should generate all 5 puzzles in under 100ms', () => {
        const start = performance.now();
        generateDailyPuzzles(TEST_DATE);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100);
    });

    it('should generate a single puzzle in under 10ms', () => {
        const start = performance.now();
        generatePuzzle(TEST_DATE, 'logic');
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(10);
    });

    it('should assign difficulty between 1 and 10', () => {
        const dates = ['2026-01-01', '2026-03-15', '2026-06-21', '2026-09-10', '2026-12-31'];

        for (const date of dates) {
            const puzzles = generateDailyPuzzles(date);
            for (const puzzle of puzzles) {
                expect(puzzle.difficulty).toBeGreaterThanOrEqual(1);
                expect(puzzle.difficulty).toBeLessThanOrEqual(10);
            }
        }
    });

    it('getTodayDateStr should return YYYY-MM-DD format', () => {
        const today = getTodayDateStr();
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('getDateRange should return the correct number of dates', () => {
        const dates = getDateRange(0, 7);
        expect(dates).toHaveLength(7);

        for (const d of dates) {
            expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
    });

    it('logic puzzle should have premises and options', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'logic');
        expect(puzzle.data.type).toBe('logic');
        expect(puzzle.data.premises.length).toBeGreaterThan(0);
        expect(puzzle.data.options.length).toBeGreaterThanOrEqual(2);
        expect(puzzle.data.correctIndex).toBeGreaterThanOrEqual(0);
    });

    it('math puzzle should have a valid expression', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'math');
        expect(puzzle.data.type).toBe('math');
        expect(puzzle.data.expression).toBeTruthy();
        expect(puzzle.data.options.length).toBeGreaterThanOrEqual(2);
        expect(typeof puzzle.data.correctAnswer).toBe('number');
    });

    it('pattern puzzle should have a grid with a missing cell', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'pattern');
        expect(puzzle.data.type).toBe('pattern');
        expect(puzzle.data.grid.length).toBeGreaterThan(0);
        const flat = puzzle.data.grid.flat();
        expect(flat).toContain(-1);
    });

    it('sequence puzzle should have a null entry (blank)', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'sequence');
        expect(puzzle.data.type).toBe('sequence');
        expect(puzzle.data.sequence).toContain(null);
        expect(puzzle.data.blankIndex).toBeGreaterThanOrEqual(0);
    });

    it('memory puzzle should have items and a display time', () => {
        const puzzle = generatePuzzle(TEST_DATE, 'memory');
        expect(puzzle.data.type).toBe('memory');
        expect(puzzle.data.items.length).toBeGreaterThan(0);
        expect(puzzle.data.displayTimeMs).toBeGreaterThan(0);
        expect(puzzle.data.question).toBeTruthy();
    });
});
