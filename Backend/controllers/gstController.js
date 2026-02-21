/**
 * GST Filing Controller
 *
 * Express handler for fetching GST filing history
 * and computing compliance scores via GSP APIs.
 */
const gspService = require('../services/gspService');

/**
 * POST /gst/fetch
 *
 * Fetches GST filing history and returns compliance analysis.
 *
 * Body:
 * {
 *   "gstin": "29AALCT1234F1Z5",
 *   "returnTypes": ["GSTR-1", "GSTR-3B"]   // optional, defaults to both
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "summary": {
 *       "totalFilings": 24,
 *       "onTimeFilings": 17,
 *       "delayedFilings": 7,
 *       "complianceScore": 0.7083,
 *       "avgTurnover": 650000,
 *       "totalTaxPaid": 2808000
 *     },
 *     "returnTypeBreakdown": { ... },
 *     "filings": [ ... ]
 *   }
 * }
 */
async function handleFetchGst(req, res) {
    try {
        const { gstin, returnTypes } = req.body;

        if (!gstin) {
            return res.status(400).json({
                success: false,
                message: 'gstin is required in the request body.',
            });
        }

        const result = await gspService.fetchGstFilings(gstin, { returnTypes });

        const statusCode = result.success ? 200 : 400;
        return res.status(statusCode).json(result);
    } catch (err) {
        console.error('[GSTController] handleFetchGst error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

module.exports = {
    handleFetchGst,
};
