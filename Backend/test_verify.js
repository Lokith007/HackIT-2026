/**
 * Verification script for HackIT-2026 Backend Enhancements
 */
const { calculateReliability } = require('./utils/reliabilityCalculator');
const { analyzeTransactions } = require('./utils/transactionParser');
const { analyzeBehaviour } = require('./utils/behaviourAnalyzer');

// 1. Test BBPS Reliability
const sampleBills = [
    { dueDate: '2025-01-01', paymentDate: '2024-12-30', paymentStatus: 'PAID', billAmount: 1000, billCategory: 'ELECTRICITY' },
    { dueDate: '2025-02-01', paymentDate: '2025-02-03', paymentStatus: 'PAID', billAmount: 1100, billCategory: 'ELECTRICITY' }, // minor delay
    { dueDate: '2025-03-01', paymentDate: '2025-03-15', paymentStatus: 'PAID', billAmount: 1200, billCategory: 'ELECTRICITY' }, // major delay
    { dueDate: '2025-04-01', paymentDate: null, paymentStatus: 'UNPAID', billAmount: 1300, billCategory: 'ELECTRICITY' }         // unpaid
];

console.log('--- BBPS Reliability Test ---');
const bbpsResult = calculateReliability(sampleBills);
console.log('Overall Score:', bbpsResult.reliabilityScore);
console.log('Trend:', bbpsResult.trend);
console.log('Breakdown:', JSON.stringify(bbpsResult.categoryBreakdown, null, 2));

// 2. Test FI Transaction Parsing
const sampleTxns = {
    transactions: [
        { amount: 50000, narration: 'Salary for Dec', type: 'CREDIT' },
        { amount: 15000, narration: 'Rent payment', type: 'DEBIT' },
        { amount: 5000, narration: 'HDFC EMI', type: 'DEBIT' },
        { amount: 5000, narration: 'HDFC EMI', type: 'DEBIT' }, // Recurring
        { amount: 200, narration: 'Swiggy order', type: 'DEBIT' },
        { amount: 1000, narration: 'Airtel Bill', type: 'DEBIT' }
    ]
};

console.log('\n--- FI Transaction Test ---');
const fiResult = analyzeTransactions(sampleTxns);
console.log('Savings Rate:', fiResult.savingsRate);
console.log('Categories:', JSON.stringify(fiResult.categoryBreakdown, null, 2));
console.log('Recurring:', JSON.stringify(fiResult.recurringPayments, null, 2));

// 3. Test Behavioural Analysis
const sampleResponses = [
    { id: 'BQ01', choice: 'Always' },
    { id: 'BQ03', choice: 'Always' },
    { id: 'BQ04', choice: 'Always' },
    { id: 'BQ05', choice: 'Always' },
    { id: 'BQ12', choice: 'Always' }
];

console.log('\n--- Behavioural Analysis Test ---');
const behResult = analyzeBehaviour(sampleResponses);
console.log('Persona:', behResult.persona.title);
console.log('Feedback:', behResult.persona.feedback);
console.log('Category Scores:', JSON.stringify(behResult.categoryBreakdown, null, 2));
