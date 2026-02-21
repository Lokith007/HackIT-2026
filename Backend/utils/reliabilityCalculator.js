/**
 * Payment Reliability Calculator
 *
 * Analyzes utility bill payment records to compute:
 *  - On-time vs delayed payment classification
 *  - Payment success rate
 *  - Weighted reliability score (0–100) for credit underwriting
 *  - Consistency and trend analysis
 */

/**
 * @typedef {Object} BillRecord
 * @property {string} billerName    - Name of the biller/utility provider.
 * @property {string} billCategory  - ELECTRICITY | WATER | BROADBAND.
 * @property {number} billAmount    - Bill amount in INR.
 * @property {string} dueDate       - ISO 8601 due date.
 * @property {string} paymentDate   - ISO 8601 last paid date.
 * @property {string} paymentStatus - PAID | UNPAID | PARTIAL.
 */

/**
 * Classifies a single bill as on-time or delayed with severity.
 *
 * @param {BillRecord} bill
 * @returns {'ON_TIME' | 'MINOR_DELAY' | 'MAJOR_DELAY' | 'UNPAID'}
 */
function classifyPayment(bill) {
    if (!bill.paymentDate || (bill.paymentStatus || '').toUpperCase() === 'UNPAID') {
        return 'UNPAID';
    }

    const due = new Date(bill.dueDate);
    const paid = new Date(bill.paymentDate);

    if (isNaN(due.getTime()) || isNaN(paid.getTime())) {
        return 'MAJOR_DELAY'; // treat invalid dates as major delay
    }

    if (paid <= due) return 'ON_TIME';

    const delayDays = computeDelayDays(bill.dueDate, bill.paymentDate);
    return delayDays <= 5 ? 'MINOR_DELAY' : 'MAJOR_DELAY';
}

/**
 * Calculates payment reliability metrics from an array of bill records.
 *
 * @param {BillRecord[]} bills
 * @returns {Object} Structured reliability output.
 */
function calculateReliability(bills) {
    if (!Array.isArray(bills) || bills.length === 0) {
        return emptyResult();
    }

    // Sort bills by due date to analyze trends (oldest first)
    const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    let onTimePayments = 0;
    let minorDelays = 0;
    let majorDelays = 0;
    let unpaidBills = 0;
    const classified = [];

    let totalWeight = 0;
    let earnedWeight = 0;

    for (const bill of sortedBills) {
        const status = classifyPayment(bill);
        const weight = 10; // Base weight per bill
        totalWeight += weight;

        let billScore = 0;
        if (status === 'ON_TIME') {
            onTimePayments++;
            billScore = 10;
        } else if (status === 'MINOR_DELAY') {
            minorDelays++;
            billScore = 6; // 40% penalty for minor delay
        } else if (status === 'MAJOR_DELAY') {
            majorDelays++;
            billScore = 2; // 80% penalty for major delay
        } else {
            unpaidBills++;
            billScore = 0; // 100% penalty for unpaid
        }

        earnedWeight += billScore;

        classified.push({
            billerName: bill.billerName || 'Unknown',
            billCategory: bill.billCategory || 'UNKNOWN',
            billAmount: bill.billAmount || 0,
            dueDate: bill.dueDate || '',
            paymentDate: bill.paymentDate || '',
            originalStatus: bill.paymentStatus || '',
            classification: status,
            delayDays: (status === 'MINOR_DELAY' || status === 'MAJOR_DELAY') ? computeDelayDays(bill.dueDate, bill.paymentDate) : 0,
            score: billScore
        });
    }

    const totalBills = bills.length;
    const paymentSuccessRate = totalBills > 0
        ? Math.round((onTimePayments / totalBills) * 10000) / 10000
        : 0;

    // Reliability Score is now weighted: (Earned / Total) * 100
    const reliabilityScore = totalWeight > 0
        ? Math.round((earnedWeight / totalWeight) * 100 * 100) / 100
        : 0;

    // Consistency: % of months/bills that were strictly ON_TIME
    const consistency = totalBills > 0 ? (onTimePayments / totalBills) : 0;

    // Trend analysis: compare last 3 bills vs overall
    const trend = detectTrend(classified);

    // Per-category breakdown
    const categoryBreakdown = buildCategoryBreakdown(classified);

    return {
        totalBills,
        onTimePayments,
        minorDelays,
        majorDelays,
        unpaidBills,
        paymentSuccessRate,
        reliabilityScore,
        consistencyScore: Math.round(consistency * 100),
        trend,
        categoryBreakdown,
        bills: classified,
    };
}

/**
 * Computes the number of days between due date and payment date.
 */
function computeDelayDays(dueDate, paymentDate) {
    const due = new Date(dueDate);
    const paid = new Date(paymentDate);
    if (isNaN(due.getTime()) || isNaN(paid.getTime())) return 0;

    const diffMs = paid.getTime() - due.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Detects trend by comparing average score of last 3 bills vs overall average.
 */
function detectTrend(classified) {
    if (classified.length < 4) return 'STABLE'; // Not enough data for trend

    const overallAvg = classified.reduce((sum, b) => sum + b.score, 0) / classified.length;
    const last3 = classified.slice(-3);
    const last3Avg = last3.reduce((sum, b) => sum + b.score, 0) / 3;

    const diff = last3Avg - overallAvg;
    if (diff > 1) return 'IMPROVING';
    if (diff < -1) return 'DECLINING';
    return 'STABLE';
}

/**
 * Builds per-category breakdown.
 */
function buildCategoryBreakdown(classified) {
    const cats = {};

    for (const bill of classified) {
        const cat = bill.billCategory.toUpperCase();
        if (!cats[cat]) {
            cats[cat] = { total: 0, onTime: 0, minorDelay: 0, majorDelay: 0, unpaid: 0, totalAmount: 0, earnedScore: 0 };
        }
        cats[cat].total++;
        cats[cat].totalAmount += bill.billAmount;
        cats[cat].earnedScore += bill.score;

        if (bill.classification === 'ON_TIME') cats[cat].onTime++;
        else if (bill.classification === 'MINOR_DELAY') cats[cat].minorDelay++;
        else if (bill.classification === 'MAJOR_DELAY') cats[cat].majorDelay++;
        else cats[cat].unpaid++;
    }

    for (const cat of Object.keys(cats)) {
        const c = cats[cat];
        c.weightedScore = c.total > 0 ? Math.round((c.earnedScore / (c.total * 10)) * 100) : 0;
        c.totalAmount = Math.round(c.totalAmount * 100) / 100;
        delete c.earnedScore; // Clean up internal field
    }

    return cats;
}

/**
 * Formats the final JSON response.
 */
function formatResponse(reliability, meta = {}) {
    return {
        success: true,
        message: `Utility payment analysis complete: ${reliability.totalBills} bills processed.`,
        data: {
            summary: {
                totalBills: reliability.totalBills,
                onTimePayments: reliability.onTimePayments,
                minorDelays: reliability.minorDelays,
                majorDelays: reliability.majorDelays,
                unpaidBills: reliability.unpaidBills,
                paymentSuccessRate: reliability.paymentSuccessRate,
                reliabilityScore: reliability.reliabilityScore,
                consistencyScore: reliability.consistencyScore,
                trend: reliability.trend
            },
            categoryBreakdown: reliability.categoryBreakdown,
            bills: reliability.bills,
            ...meta,
        },
    };
}

function emptyResult() {
    return {
        totalBills: 0,
        onTimePayments: 0,
        minorDelays: 0,
        majorDelays: 0,
        unpaidBills: 0,
        paymentSuccessRate: 0,
        reliabilityScore: 0,
        consistencyScore: 0,
        trend: 'NONE',
        categoryBreakdown: {},
        bills: [],
    };
}

module.exports = {
    classifyPayment,
    calculateReliability,
    computeDelayDays,
    formatResponse,
};
