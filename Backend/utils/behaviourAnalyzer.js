/**
 * Behavioural Risk Analyzer
 *
 * Analyzes quiz responses to calculate category-wise scores
 * and generates a qualitative persona-based feedback.
 */
const QUESTION_POOL = require('../data/questionPool');

/**
 * Analyzes responses and returns category-wise scores and persona feedback.
 * 
 * @param {Object[]} responses - [{ id, choice }]
 * @returns {Object} Detailed analysis.
 */
function analyzeBehaviour(responses) {
    const categoryScores = {};
    const categoryTotals = {};

    // Map choices to 1-5
    const OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

    responses.forEach(r => {
        const question = QUESTION_POOL.find(q => q.questionId === r.id);
        if (!question) return;

        const cat = question.category || 'misc';
        const value = OPTIONS.indexOf(r.choice) + 1;

        if (!categoryScores[cat]) {
            categoryScores[cat] = 0;
            categoryTotals[cat] = 0;
        }

        categoryScores[cat] += value;
        categoryTotals[cat] += 5; // Max possible per question
    });

    // Calculate percentages per category
    const categoryBreakdown = {};
    for (const cat in categoryScores) {
        categoryBreakdown[cat] = {
            score: categoryScores[cat],
            maxScore: categoryTotals[cat],
            percentage: Math.round((categoryScores[cat] / categoryTotals[cat]) * 100)
        };
    }

    const overallScore = responses.reduce((sum, r) => sum + (OPTIONS.indexOf(r.choice) + 1), 0);
    const overallPercentage = Math.round((overallScore / (responses.length * 5)) * 100);

    const persona = generatePersona(categoryBreakdown, overallPercentage);

    return {
        categoryBreakdown,
        overallPercentage,
        persona
    };
}

/**
 * Generates a persona based on category breakthroughs.
 */
function generatePersona(breakdown, overall) {
    if (overall > 80) return {
        title: 'Prudent Strategist',
        feedback: 'Demonstrates exceptional financial discipline and robust risk preparedness. Highly likely to manage credit effectively.'
    };

    if (overall > 60) return {
        title: 'Reliable Operator',
        feedback: 'Shows consistent financial habits and moderate risk awareness. A dependable borrower with stable growth potential.'
    };

    if (overall > 40) return {
        title: 'Emerging Professional',
        feedback: 'Exhibits basic financial controls but could benefit from better debt management and emergency planning.'
    };

    return {
        title: 'High-Touch Applicant',
        feedback: 'Significant gaps detected in financial discipline and compliance. May require additional collateral or periodic monitoring.'
    };
}

module.exports = {
    analyzeBehaviour
};
