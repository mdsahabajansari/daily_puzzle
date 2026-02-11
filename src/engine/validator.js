/**
 * validator.js — Puzzle answer validation
 */

/**
 * Validate a player's answer for a given puzzle.
 */
export function validateAnswer(puzzle, input) {
    const isCorrect = checkAnswer(puzzle.data, input.answer);

    if (!isCorrect) {
        return {
            correct: false,
            score: 0,
            timeTaken: input.timeTaken,
            hintsUsed: input.hintsUsed,
            feedback: `Incorrect! The answer was ${puzzle.solution}.`,
        };
    }

    const baseScore = puzzle.maxScore;
    const speedRatio = Math.max(0, (puzzle.timeLimit - input.timeTaken) / puzzle.timeLimit);
    const speedBonus = Math.round(speedRatio * 0.3 * baseScore);
    const hintPenalty = Math.round(input.hintsUsed * 0.15 * baseScore);
    const finalScore = Math.max(10, baseScore + speedBonus - hintPenalty);

    return {
        correct: true,
        score: finalScore,
        timeTaken: input.timeTaken,
        hintsUsed: input.hintsUsed,
        feedback: getPositiveFeedback(finalScore, puzzle.maxScore),
    };
}

/**
 * Check if an answer is correct based on puzzle type.
 */
function checkAnswer(data, answer) {
    switch (data.type) {
        case 'logic':
            return (
                data.options[data.correctIndex] === String(answer) ||
                data.correctIndex === Number(answer)
            );

        case 'math':
            return Number(answer) === data.correctAnswer;

        case 'pattern':
            return Number(answer) === data.correctAnswer;

        case 'sequence':
            return Number(answer) === data.correctAnswer;

        case 'memory':
            return (
                data.options[data.correctIndex] === String(answer) ||
                data.correctIndex === Number(answer)
            );

        default:
            return false;
    }
}

function getPositiveFeedback(score, maxScore) {
    const ratio = score / maxScore;
    if (ratio >= 1.2) return '🔥 Incredible! Speed bonus earned!';
    if (ratio >= 1.0) return '⭐ Perfect score!';
    if (ratio >= 0.8) return '✨ Great job!';
    if (ratio >= 0.6) return '👍 Nice work!';
    return '✅ Correct!';
}

/**
 * Validate that a puzzle ID matches the expected format.
 */
export function isValidPuzzleId(id) {
    const pattern = /^\d{4}-\d{2}-\d{2}-(logic|math|pattern|sequence|memory)$/;
    return pattern.test(id);
}
