const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const config = require('../config');
const { selectQuestions, validateResponses, calculateScore } = require('../utils/quizEngine');
const { analyzeBehaviour } = require('../utils/behaviourAnalyzer');

// ... (rest of the file as before, updated below)

/**
 * Validates responses, calculates score, and stores anonymized result.
 *
 * @param {Object[]} responses - [{ questionId, answer }]
 * @returns {Promise<Object>}
 */
async function submitQuiz(responses) {
    // 1. Validate
    const validation = validateResponses(responses);
    if (!validation.valid) {
        return { success: false, message: 'Validation failed.', errors: validation.errors };
    }

    // 2. Calculate core score
    const { totalScore, behaviourScore, normalizedScore } = calculateScore(responses);

    // 3. Perform detailed behavioural analysis
    const detailedAnalysis = analyzeBehaviour(responses);

    // 4. Store anonymized result
    const sessionId = uuidv4();
    const timestamp = new Date().toISOString();

    if (useDb) {
        try {
            await pool.query(INSERT_SQL, [sessionId, normalizedScore, totalScore]);
            console.log(`[BehaviourService] Result stored in DB: ${sessionId}`);
        } catch (err) {
            console.warn(`[BehaviourService] DB insert failed, using memory: ${err.message}`);
            memoryStore.set(sessionId, { normalizedScore, totalScore, createdAt: timestamp });
        }
    } else {
        memoryStore.set(sessionId, { normalizedScore, totalScore, createdAt: timestamp });
    }

    // 5. Return enriched scores
    return {
        success: true,
        message: 'Behavioural risk assessment completed.',
        data: {
            sessionId,
            riskScore: detailedAnalysis.overallPercentage,
            persona: detailedAnalysis.persona,
            categoryBreakdown: detailedAnalysis.categoryBreakdown,
            analysis: detailedAnalysis.persona.feedback,
            behaviourScore,
            normalizedScore,
            totalScore,
            maxScore: responses.length * 5,
            timestamp,
        },
    };
}

module.exports = {
    init,
    getQuizQuestions,
    submitQuiz,
};
