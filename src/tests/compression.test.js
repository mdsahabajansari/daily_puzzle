/**
 * compression.test.js — Tests for the LZ compression module
 */

import { describe, it, expect } from 'vitest';
import { compressData, decompressData, getCompressionRatio } from '@/storage/compression';

describe('Compression', () => {
    it('should compress and decompress a string back to original', () => {
        const original = JSON.stringify({
            puzzles: [
                { id: '2026-02-11-logic', type: 'logic', data: { premises: ['Alice has a cat', 'Bob has a dog'] } },
                { id: '2026-02-11-math', type: 'math', data: { expression: '15 + 27' } },
            ],
        });

        const compressed = compressData(original);
        const decompressed = decompressData(compressed);

        expect(decompressed).toBe(original);
    });

    it('should pass through short strings uncompressed', () => {
        const short = 'hello world';
        const compressed = compressData(short);

        expect(compressed).toBe(`RAW:${short}`);
        expect(decompressData(compressed)).toBe(short);
    });

    it('should handle empty strings', () => {
        expect(compressData('')).toBe('');
        expect(decompressData('')).toBe('');
    });

    it('should actually reduce size for large repetitive data', () => {
        const large = JSON.stringify(
            Array.from({ length: 50 }, (_, i) => ({
                id: `puzzle-${i}`,
                type: 'logic',
                description: 'This is a puzzle description that repeats often.',
                data: { premises: ['premise one', 'premise two', 'premise three'] },
            })),
        );

        const compressed = compressData(large);
        const ratio = getCompressionRatio(large, compressed);

        expect(ratio).toBeLessThan(0.8);
        expect(decompressData(compressed)).toBe(large);
    });
});
