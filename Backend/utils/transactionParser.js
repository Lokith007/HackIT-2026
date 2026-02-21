/**
 * Transaction Parser
 *
 * Parses decrypted financial information data from Account Aggregator
 * FI/fetch responses. Extracts transaction details, separates CREDIT
 * and DEBIT transactions, and calculates inflow/outflow summaries.
 */

const CATEGORY_MAP = {
    Salary: [/salary/i, /payrun/i, /direct dep/i, /payroll/i],
    Rent: [/rent/i, /landlord/i, /housing/i],
    Utilities: [/electricity/i, /water/i, /broadband/i, /bescom/i, /airtel/i, /jio/i, /recharge/i],
    EMI: [/emi/i, /loan/i, /mortgage/i, /hdfc loan/i, /icici loan/i, /finance/i],
    Investment: [/mutual fund/i, /stock/i, /zerodha/i, /groww/i, /investment/i, /fd/i, /rd/i],
    Shopping: [/amazon/i, /flipkart/i, /myntra/i, /shopping/i, /pos/i],
    Food: [/swiggy/i, /zomato/i, /restaurant/i, /groceries/i, /bigbasket/i],
    Travel: [/uber/i, /ola/i, /fuel/i, /petrol/i, /irctc/i, /indigo/i],
    UPI_Transfer: [/upi/i, /@/i],
};

/**
 * @typedef {Object} Transaction
 * @property {string} txnId      - Transaction identifier.
 * @property {string} date       - Transaction date (ISO 8601).
 * @property {string} type       - 'CREDIT' or 'DEBIT'.
 * @property {string} mode       - Transaction mode (UPI, NEFT, IMPS, etc.).
 * @property {number} amount     - Transaction amount.
 * @property {number} balance    - Account balance after transaction.
 * @property {string} narration  - Transaction description/narration.
 * @property {string} reference  - Reference number.
 * @property {string} category   - Inferred category.
 */

/**
 * Parses raw FI data into structured transactions.
 */
function parseTransactions(rawData) {
    try {
        let data;
        if (typeof rawData === 'string') {
            try {
                data = JSON.parse(rawData);
            } catch {
                return { success: false, error: 'Failed to parse FI data as JSON.' };
            }
        } else {
            data = rawData;
        }

        let rawTransactions = extractTransactionArray(data);

        if (!rawTransactions || rawTransactions.length === 0) {
            return {
                success: true,
                transactions: [],
                summary: createEmptySummary(),
            };
        }

        const transactions = rawTransactions.map(normalizeTransaction).filter(Boolean);

        return {
            success: true,
            transactions,
            count: transactions.length,
        };
    } catch (err) {
        return { success: false, error: `Transaction parsing failed: ${err.message}` };
    }
}

/**
 * Extracts the transaction array from various AA response structures.
 */
function extractTransactionArray(data) {
    if (Array.isArray(data)) return data;
    if (data?.Account?.Transactions?.Transaction) {
        return Array.isArray(data.Account.Transactions.Transaction)
            ? data.Account.Transactions.Transaction
            : [data.Account.Transactions.Transaction];
    }
    if (data?.Transactions && Array.isArray(data.Transactions)) return data.Transactions;
    if (data?.transactions && Array.isArray(data.transactions)) return data.transactions;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.txnId || data?.transactionId || data?.amount) return [data];
    return [];
}

/**
 * Normalizes a transaction object and categorizes it.
 */
function normalizeTransaction(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const type = detectTransactionType(raw);
    const amount = parseFloat(raw.amount || raw.Amount || raw.txnAmount || 0);
    const balance = parseFloat(raw.balance || raw.Balance || raw.currentBalance || raw.closingBalance || 0);
    const narration = raw.narration || raw.Narration || raw.description || raw.remarks || '';

    return {
        txnId: raw.txnId || raw.transactionId || raw.TransactionId || raw.refNo || '',
        date: raw.date || raw.Date || raw.transactionDateTime || raw.TransactionTimestamp || raw.valueDate || '',
        type,
        mode: raw.mode || raw.Mode || raw.transactionMode || raw.channel || '',
        amount: isNaN(amount) ? 0 : amount,
        balance: isNaN(balance) ? 0 : balance,
        narration: narration,
        reference: raw.reference || raw.Reference || raw.refNo || raw.referenceNumber || '',
        category: inferCategory(narration),
    };
}

/**
 * Infers category from narration.
 */
function inferCategory(narration) {
    const text = narration.toLowerCase();
    for (const [category, patterns] of Object.entries(CATEGORY_MAP)) {
        if (patterns.some((p) => p.test(text))) {
            return category;
        }
    }
    return 'Misc';
}

/**
 * Detects whether a transaction is CREDIT or DEBIT.
 */
function detectTransactionType(raw) {
    const type = (raw.type || raw.Type || raw.transactionType || raw.TransactionType || raw.txnType || '').toUpperCase();
    if (type.includes('CREDIT') || type === 'CR' || type === 'C') return 'CREDIT';
    if (type.includes('DEBIT') || type === 'DR' || type === 'D') return 'DEBIT';
    const narration = (raw.narration || raw.description || '').toLowerCase();
    if (narration.includes('credit') || narration.includes('received') || narration.includes('deposit')) return 'CREDIT';
    return 'DEBIT';
}

/**
 * Calculates inflow, outflow, categorization, and savings rate.
 */
function calculateFlows(transactions) {
    const credits = transactions.filter((t) => t.type === 'CREDIT');
    const debits = transactions.filter((t) => t.type === 'DEBIT');

    const totalInflow = credits.reduce((sum, t) => sum + t.amount, 0);
    const totalOutflow = debits.reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalInflow - totalOutflow;
    const savingsRate = totalInflow > 0 ? (netFlow / totalInflow) : 0;

    const categoryBreakdown = {};
    transactions.forEach(t => {
        if (!categoryBreakdown[t.category]) categoryBreakdown[t.category] = { count: 0, amount: 0 };
        categoryBreakdown[t.category].count++;
        categoryBreakdown[t.category].amount += t.amount;
    });

    const recurringPayments = detectRecurring(debits);

    return {
        totalInflow: Math.round(totalInflow * 100) / 100,
        totalOutflow: Math.round(totalOutflow * 100) / 100,
        netFlow: Math.round(netFlow * 100) / 100,
        savingsRate: Math.round(savingsRate * 10000) / 10000,
        creditCount: credits.length,
        debitCount: debits.length,
        totalTransactions: transactions.length,
        categoryBreakdown,
        recurringPayments,
        credits: credits.slice(0, 50), // Sample
        debits: debits.slice(0, 50),   // Sample
    };
}

/**
 * Heuristic to detect recurring payments (same amount/narration patterns).
 */
function detectRecurring(debits) {
    const recurring = [];
    const groups = {};

    debits.forEach(t => {
        const key = `${t.amount}-${t.narration.substring(0, 10)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    for (const [key, items] of Object.entries(groups)) {
        if (items.length >= 2) {
            recurring.push({
                narration: items[0].narration,
                amount: items[0].amount,
                frequency: items.length > 5 ? 'Weekly/Biweekly' : 'Monthly',
                count: items.length
            });
        }
    }

    return recurring.slice(0, 5);
}

/**
 * Full analysis pipeline.
 */
function analyzeTransactions(rawData) {
    const parsed = parseTransactions(rawData);
    if (!parsed.success) return parsed;
    const flows = calculateFlows(parsed.transactions);
    return { success: true, ...flows };
}

function createEmptySummary() {
    return {
        totalInflow: 0, totalOutflow: 0, netFlow: 0, savingsRate: 0,
        creditCount: 0, debitCount: 0, totalTransactions: 0,
        categoryBreakdown: {}, recurringPayments: [],
        credits: [], debits: []
    };
}

module.exports = {
    parseTransactions,
    analyzeTransactions,
    normalizeTransaction,
};
