/**
 * Behavioural Risk Question Pool
 *
 * 20 predefined behavioural finance questions for MSME risk assessment.
 * Each question is scored on a 1–5 Likert scale where:
 *   1 = Strongly disagree / Never
 *   5 = Strongly agree / Always
 *
 * Higher scores indicate higher risk tolerance / better financial behaviour.
 */

const QUESTION_POOL = [
    {
        questionId: 'BQ01',
        questionText: 'I maintain a separate bank account exclusively for business transactions.',
        category: 'financial_discipline',
    },
    {
        questionId: 'BQ02',
        questionText: 'I regularly review my business financial statements (P&L, Balance Sheet) at least monthly.',
        category: 'financial_discipline',
    },
    {
        questionId: 'BQ03',
        questionText: 'I have an emergency fund that covers at least 3 months of business operating expenses.',
        category: 'risk_preparedness',
    },
    {
        questionId: 'BQ04',
        questionText: 'I make all statutory payments (GST, TDS, PF) before their due dates.',
        category: 'compliance',
    },
    {
        questionId: 'BQ05',
        questionText: 'I avoid taking on new debt without a clear repayment plan.',
        category: 'debt_management',
    },
    {
        questionId: 'BQ06',
        questionText: 'I maintain insurance coverage for my business assets and operations.',
        category: 'risk_preparedness',
    },
    {
        questionId: 'BQ07',
        questionText: 'I negotiate payment terms with suppliers before placing large orders.',
        category: 'cash_flow',
    },
    {
        questionId: 'BQ08',
        questionText: 'I follow up on outstanding receivables within 7 days of the due date.',
        category: 'cash_flow',
    },
    {
        questionId: 'BQ09',
        questionText: 'I reinvest a fixed percentage of profits back into the business each quarter.',
        category: 'growth_mindset',
    },
    {
        questionId: 'BQ10',
        questionText: 'I diversify my revenue sources rather than depending on a single client or product.',
        category: 'risk_preparedness',
    },
    {
        questionId: 'BQ11',
        questionText: 'I use digital tools (accounting software, UPI, invoicing apps) for financial management.',
        category: 'digital_adoption',
    },
    {
        questionId: 'BQ12',
        questionText: 'I keep personal and business expenses completely separate.',
        category: 'financial_discipline',
    },
    {
        questionId: 'BQ13',
        questionText: 'I budget for upcoming expenses at least one quarter in advance.',
        category: 'cash_flow',
    },
    {
        questionId: 'BQ14',
        questionText: 'I maintain a healthy credit utilisation ratio (below 30%) on business credit lines.',
        category: 'debt_management',
    },
    {
        questionId: 'BQ15',
        questionText: 'I regularly compare prices from multiple vendors before making procurement decisions.',
        category: 'financial_discipline',
    },
    {
        questionId: 'BQ16',
        questionText: 'I have written standard operating procedures for financial approvals in my organisation.',
        category: 'governance',
    },
    {
        questionId: 'BQ17',
        questionText: 'I monitor industry trends and adjust my business strategy accordingly.',
        category: 'growth_mindset',
    },
    {
        questionId: 'BQ18',
        questionText: 'I seek professional advice (CA, financial advisor) for major financial decisions.',
        category: 'governance',
    },
    {
        questionId: 'BQ19',
        questionText: 'I pay my suppliers on or before the agreed payment terms.',
        category: 'compliance',
    },
    {
        questionId: 'BQ20',
        questionText: 'I have a documented succession or business continuity plan in place.',
        category: 'risk_preparedness',
    },
];

module.exports = QUESTION_POOL;
