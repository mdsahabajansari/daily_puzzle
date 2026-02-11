/**
 * compression.js — Lightweight data compression for IndexedDB
 */

/**
 * Compress a string using a simple LZ-style algorithm.
 */
export function compressData(input) {
    if (!input || input.length === 0) return '';
    if (input.length < 100) return `RAW:${input}`;

    const dictionary = new Map();
    let dictSize = 256;
    const result = [];

    for (let i = 0; i < 256; i++) {
        dictionary.set(String.fromCharCode(i), i);
    }

    let current = '';

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const combined = current + char;

        if (dictionary.has(combined)) {
            current = combined;
        } else {
            result.push(dictionary.get(current));
            if (dictSize < 65536) {
                dictionary.set(combined, dictSize++);
            }
            current = char;
        }
    }

    if (current.length > 0) {
        result.push(dictionary.get(current));
    }

    return 'LZ:' + result.map((code) => String.fromCharCode(code)).join('');
}

/**
 * Decompress a string compressed by compressData.
 */
export function decompressData(compressed) {
    if (!compressed || compressed.length === 0) return '';
    if (compressed.startsWith('RAW:')) return compressed.slice(4);
    if (!compressed.startsWith('LZ:')) return compressed;

    const data = compressed.slice(3);
    const codes = Array.from(data).map((ch) => ch.charCodeAt(0));
    if (codes.length === 0) return '';

    const dictionary = new Map();
    let dictSize = 256;

    for (let i = 0; i < 256; i++) {
        dictionary.set(i, String.fromCharCode(i));
    }

    let previous = dictionary.get(codes[0]);
    const result = [previous];

    for (let i = 1; i < codes.length; i++) {
        const code = codes[i];
        let entry;

        if (dictionary.has(code)) {
            entry = dictionary.get(code);
        } else if (code === dictSize) {
            entry = previous + previous.charAt(0);
        } else {
            throw new Error(`Decompression error: invalid code ${code}`);
        }

        result.push(entry);

        if (dictSize < 65536) {
            dictionary.set(dictSize++, previous + entry.charAt(0));
        }

        previous = entry;
    }

    return result.join('');
}

/**
 * Calculate compression ratio.
 */
export function getCompressionRatio(original, compressed) {
    return compressed.length / original.length;
}
