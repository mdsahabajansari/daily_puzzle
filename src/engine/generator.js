/**
 * generator.js — Date-seeded deterministic puzzle generator
 */

/**
 * Creates a seeded random number generator.
 * @param {number} seed
 */
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Converts a date string to a numeric seed.
 */
function dateToSeed(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
}

/** Pick a random integer in [min, max] using the seeded RNG */
function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

/** Shuffle an array in place using Fisher-Yates with seeded RNG */
function shuffle(rng, arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** Pick one random element from an array */
function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
}

/**
 * Calculates difficulty (1-10) based on the day of the year.
 */
function getDifficulty(dateStr, typeIndex) {
    const date = new Date(dateStr);
    const dayOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const base = Math.sin((dayOfYear / 365) * Math.PI) * 4.5 + 5.5;
    const offset = (typeIndex * 1.3) % 3 - 1.5;
    return Math.max(1, Math.min(10, Math.round(base + offset)));
}

// Puzzle generators

function generateLogicPuzzle(rng, difficulty) {
    const people = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank'];
    const items = ['cat', 'dog', 'fish', 'bird', 'rabbit', 'turtle'];
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

    const count = Math.min(2 + Math.floor(difficulty / 3), 4);
    const selectedPeople = shuffle(rng, people).slice(0, count);
    const selectedItems = shuffle(rng, items).slice(0, count);
    const selectedColors = shuffle(rng, colors).slice(0, count);

    const assignments = selectedPeople.map((person, i) => ({
        person,
        item: selectedItems[i],
        color: selectedColors[i],
    }));

    const premises = [];
    premises.push(`${assignments[0].person} has a ${assignments[0].color} ${assignments[0].item}.`);
    if (count > 1) {
        premises.push(`${assignments[1].person} does NOT have a ${assignments[0].item}.`);
    }
    if (count > 2) {
        premises.push(`The person with the ${assignments[2].item} likes ${assignments[2].color}.`);
    }
    if (difficulty >= 5) {
        premises.push(`${assignments[count - 1].person} doesn't like ${assignments[0].color}.`);
    }

    const targetIdx = randInt(rng, 0, count - 1);
    const target = assignments[targetIdx];
    const correctAnswer = target.person;

    const wrongAnswers = selectedPeople.filter((p) => p !== correctAnswer);
    const options = shuffle(rng, [correctAnswer, ...wrongAnswers.slice(0, 3)]);
    const correctIndex = options.indexOf(correctAnswer);

    return {
        type: 'logic',
        title: 'Logic Deduction',
        description: `Based on the clues, who has the ${target.item}?`,
        data: { type: 'logic', premises, options, correctIndex },
        hints: [
            `Focus on what ${assignments[0].person} owns.`,
            `Eliminate people who can't have the ${target.item}.`,
            `The answer is ${correctAnswer.charAt(0)}...`,
        ],
        solution: correctAnswer,
    };
}

function generateMathPuzzle(rng, difficulty) {
    const ops = ['+', '-', '×'];
    if (difficulty >= 5) ops.push('÷');

    const maxNum = 5 + difficulty * 3;
    const a = randInt(rng, 2, maxNum);
    const b = randInt(rng, 2, Math.max(2, Math.floor(maxNum / 2)));
    const op = pick(rng, ops);

    let correctAnswer;
    let expression;

    switch (op) {
        case '+':
            correctAnswer = a + b;
            expression = `${a} + ${b}`;
            break;
        case '-':
            correctAnswer = Math.max(a, b) - Math.min(a, b);
            expression = `${Math.max(a, b)} - ${Math.min(a, b)}`;
            break;
        case '×':
            correctAnswer = a * b;
            expression = `${a} × ${b}`;
            break;
        case '÷': {
            const product = a * b;
            correctAnswer = a;
            expression = `${product} ÷ ${b}`;
            break;
        }
        default:
            correctAnswer = a + b;
            expression = `${a} + ${b}`;
    }

    if (difficulty >= 7) {
        const c = randInt(rng, 1, 10);
        correctAnswer = correctAnswer + c;
        expression = `(${expression}) + ${c}`;
    }

    const wrongSet = new Set();
    while (wrongSet.size < 3) {
        const offset = randInt(rng, 1, 5) * (rng() > 0.5 ? 1 : -1);
        const wrong = correctAnswer + offset;
        if (wrong !== correctAnswer && wrong > 0) wrongSet.add(wrong);
    }

    const options = shuffle(rng, [correctAnswer, ...Array.from(wrongSet)]);

    return {
        type: 'math',
        title: 'Quick Math',
        description: `What is ${expression}?`,
        data: { type: 'math', expression, options, correctAnswer },
        hints: [
            `The answer is between ${correctAnswer - 5} and ${correctAnswer + 5}.`,
            `It's ${correctAnswer % 2 === 0 ? 'an even' : 'an odd'} number.`,
            `The first digit is ${String(correctAnswer).charAt(0)}.`,
        ],
        solution: correctAnswer,
    };
}

function generatePatternPuzzle(rng, difficulty) {
    const size = difficulty <= 3 ? 3 : difficulty <= 7 ? 4 : 5;
    const baseMultiplier = randInt(rng, 2, 4);
    const grid = [];

    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            row.push((r + 1) * baseMultiplier + c + randInt(rng, 0, 1));
        }
        grid.push(row);
    }

    const missingRow = randInt(rng, 0, size - 1);
    const missingCol = randInt(rng, 0, size - 1);
    const correctAnswer = grid[missingRow][missingCol];
    grid[missingRow][missingCol] = -1;

    const wrongSet = new Set();
    while (wrongSet.size < 3) {
        const wrong = correctAnswer + randInt(rng, -3, 3);
        if (wrong !== correctAnswer && wrong > 0) wrongSet.add(wrong);
    }

    const options = shuffle(rng, [correctAnswer, ...Array.from(wrongSet)]);

    return {
        type: 'pattern',
        title: 'Pattern Grid',
        description: 'Find the missing number in the grid. Look for the pattern in rows and columns.',
        data: { type: 'pattern', grid, missingRow, missingCol, options, correctAnswer },
        hints: [
            `Look at the row: the pattern involves multiples of ${baseMultiplier}.`,
            `Check adjacent cells for the relationship.`,
            `The missing number is ${correctAnswer > 10 ? 'greater than 10' : '10 or less'}.`,
        ],
        solution: correctAnswer,
    };
}

function generateSequencePuzzle(rng, difficulty) {
    const seqLength = 4 + Math.floor(difficulty / 3);
    const seqTypes = ['arithmetic'];
    if (difficulty >= 3) seqTypes.push('geometric');
    if (difficulty >= 6) seqTypes.push('fibonacci_like');

    const seqType = pick(rng, seqTypes);
    const sequence = [];

    switch (seqType) {
        case 'arithmetic': {
            const start = randInt(rng, 1, 10);
            const diff = randInt(rng, 2, 3 + Math.floor(difficulty / 2));
            for (let i = 0; i < seqLength; i++) {
                sequence.push(start + diff * i);
            }
            break;
        }
        case 'geometric': {
            const start = randInt(rng, 2, 4);
            const ratio = randInt(rng, 2, 3);
            for (let i = 0; i < seqLength; i++) {
                sequence.push(start * Math.pow(ratio, i));
            }
            break;
        }
        case 'fibonacci_like': {
            const a = randInt(rng, 1, 5);
            const b = randInt(rng, 1, 5);
            sequence.push(a, b);
            for (let i = 2; i < seqLength; i++) {
                sequence.push(sequence[i - 1] + sequence[i - 2]);
            }
            break;
        }
    }

    const blankIndex = randInt(rng, 1, seqLength - 2);
    const correctAnswer = sequence[blankIndex];
    const displaySequence = [...sequence];
    displaySequence[blankIndex] = null;

    const wrongSet = new Set();
    while (wrongSet.size < 3) {
        const offset = randInt(rng, 1, 6) * (rng() > 0.5 ? 1 : -1);
        const wrong = correctAnswer + offset;
        if (wrong !== correctAnswer && wrong > 0) wrongSet.add(wrong);
    }

    const options = shuffle(rng, [correctAnswer, ...Array.from(wrongSet)]);

    return {
        type: 'sequence',
        title: 'Number Sequence',
        description: 'Find the missing number in the sequence.',
        data: { type: 'sequence', sequence: displaySequence, blankIndex, options, correctAnswer },
        hints: [
            `Look at the differences between consecutive numbers.`,
            `The sequence follows a ${seqType.replace('_', ' ')} pattern.`,
            `The missing number is ${correctAnswer % 2 === 0 ? 'even' : 'odd'}.`,
        ],
        solution: correctAnswer,
    };
}

function generateMemoryPuzzle(rng, difficulty) {
    const allEmojis = ['🍎', '🌟', '🎯', '🔥', '💎', '🌈', '🎸', '🚀', '🌙', '🎪', '⚡', '🌺', '🦁', '🐬', '🍕'];
    const count = 3 + Math.floor(difficulty / 2);
    const items = shuffle(rng, allEmojis).slice(0, count);
    const displayTimeMs = Math.max(2000, 6000 - difficulty * 400);

    const questionTypes = [
        { q: (idx) => `What was item #${idx + 1}?`, getAnswer: (idx) => items[idx] },
        { q: () => `How many items were shown?`, getAnswer: () => String(count) },
    ];

    const qType = pick(rng, questionTypes);
    const targetIdx = randInt(rng, 0, count - 1);
    const question = qType.q(targetIdx);
    const correctAnswer = qType.getAnswer(targetIdx);

    let options;
    if (question.includes('How many')) {
        options = shuffle(rng, [String(count), String(count - 1), String(count + 1), String(count + 2)]);
    } else {
        const wrong = shuffle(rng, allEmojis.filter((e) => e !== correctAnswer)).slice(0, 3);
        options = shuffle(rng, [correctAnswer, ...wrong]);
    }

    const correctIndex = options.indexOf(correctAnswer);

    return {
        type: 'memory',
        title: 'Memory Flash',
        description: 'Memorize the items shown, then answer the question!',
        data: { type: 'memory', items, displayTimeMs, question, options, correctIndex },
        hints: [
            `There are ${count} items to remember.`,
            `Focus on the positions of items.`,
            `The answer involves "${correctAnswer}".`,
        ],
        solution: correctAnswer,
    };
}

const PUZZLE_TYPES = ['logic', 'math', 'pattern', 'sequence', 'memory'];

const GENERATORS = {
    logic: generateLogicPuzzle,
    math: generateMathPuzzle,
    pattern: generatePatternPuzzle,
    sequence: generateSequencePuzzle,
    memory: generateMemoryPuzzle,
};

/**
 * Generate all 5 puzzles for a given date.
 */
export function generateDailyPuzzles(dateStr) {
    const seed = dateToSeed(dateStr);
    const rng = mulberry32(seed);

    return PUZZLE_TYPES.map((type, index) => {
        const difficulty = getDifficulty(dateStr, index);
        const generated = GENERATORS[type](rng, difficulty);

        return {
            ...generated,
            id: `${dateStr}-${type}`,
            date: dateStr,
            difficulty,
            timeLimit: Math.max(30, 120 - difficulty * 8),
            maxScore: 100 + difficulty * 20,
        };
    });
}

/**
 * Generate a single puzzle by type and date.
 */
export function generatePuzzle(dateStr, type) {
    const index = PUZZLE_TYPES.indexOf(type);
    const seed = dateToSeed(dateStr) + index;
    const rng = mulberry32(seed);
    const difficulty = getDifficulty(dateStr, index);
    const generated = GENERATORS[type](rng, difficulty);

    return {
        ...generated,
        id: `${dateStr}-${type}`,
        date: dateStr,
        difficulty,
        timeLimit: Math.max(30, 120 - difficulty * 8),
        maxScore: 100 + difficulty * 20,
    };
}

/**
 * Get today's date as an ISO string.
 */
export function getTodayDateStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Get an array of date strings for a range.
 */
export function getDateRange(startOffset, count) {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + startOffset + i);
        dates.push(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        );
    }
    return dates;
}
