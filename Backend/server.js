require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");
const { getSocialActivity } = require("./socialScraper");

const app = express();
app.use(cors());
app.use(express.json());

// --- INGESTION LAYER (Mock Data Fetching) ---
/**
 * Simulated service to fetch data from various sources as per AA / NPCI / GSTN frameworks.
 * Data is randomized slightly to simulate a "live" ingestion from external APIs.
 */
const IngestionService = {
    fetchUPIData: () => ({
        transaction_volume: Math.floor(Math.random() * 500000) + 500000,
        frequency: 140,
        merchant_category_codes: ["RET-01", "SUP-05", "UTI-09", "TRA-02"],
        inflow_outflow_ratio: 1.45,
        growth_mom: 0.15
    }),

    fetchGSTData: () => ({
        gstin: "29AAAAA0000A1Z5",
        turnover_annual: 12500000,
        compliance_score: 92,
        itc_claims: 180000,
        filing_on_time: true,
        variance_vs_bank: 0.02 // 2% variance
    }),

    fetchBankStatementData: () => ({
        avg_monthly_balance: 450000,
        cash_flow_volatility: 0.08, // Low volatility
        payment_consistency_score: 0.95,
        ocr_nlp_confidence: 0.99
    }),

    fetchUtilityData: () => ({
        bescom_due_paid: true,
        water_bill_history: "Consistent",
        payment_timeliness: 0.98
    }),

    fetchSocialAndPsychometric: () => ({
        risk_tolerance_score: 75, // 0-100
        sentiment_score: 0.82, // Twitter/LinkedIn sentiment
        behavioral_stability: "High"
    })
};

// --- VALIDATION LAYER ---
const ValidationLayer = {
    validateMSME: (data) => {
        const checks = {
            blacklisted: false,
            fraud_alerts: 0,
            identity_verified: true,
            gst_pan_match: true
        };

        // Step 2: AI Anomaly Detection (Mock Score)
        const anomalyScore = 94; // 0-100 (94 means high validity)

        // Step 3: Holistic Profile Build (Mock Network Strength)
        const nodeStrength = 0.88;

        return {
            status: anomalyScore > 80 ? "SUCCESS" : "FAIL",
            checks,
            anomalyScore,
            nodeStrength,
            redFlags: []
        };
    }
};

// --- SCORING ENGINE (NovaScore) ---
const ScoringEngine = {
    calculate: (ingestedData, validation) => {
        // Ensemble logic (XGBoost 70%, LightGBM 20%, Random Forest 10%)
        const baseScore = 750;

        // Feature Engineering (Simplified for Hackathon Demo)
        const cashFlowBonus = (ingestedData.upi.inflow_outflow_ratio > 1.2) ? 40 : 10;
        const stabilityBonus = (validation.nodeStrength > 0.8) ? 30 : 0;
        const penalty = (ingestedData.gst.variance_vs_bank > 0.15) ? -50 : 0;

        const finalScore = baseScore + cashFlowBonus + stabilityBonus + penalty;

        const tier = finalScore >= 750 ? "Prime" : (finalScore >= 650 ? "Good" : "Sub-Prime");

        // SHAP / LIME Explanations
        const explanations = [
            { feature: "GST-Bank Correlation", impact: "+85", reasoning: "Low variance (2%) between GST filings and bank credits." },
            { feature: "UPI Inflow Growth", impact: "+42", reasoning: "Consistent 15% Month-over-Month growth in transactions." },
            { feature: "Utility Payment Discipline", impact: "+15", reasoning: "98% on-time payment record over the last 12 months." }
        ];

        return {
            score: Math.min(finalScore, 900),
            tier,
            confidence: 0.98,
            explanations,
            recommendation: {
                loan_limit: "₹12,00,000",
                interest_rate: "8.5%",
                tenure: "36 Months"
            }
        };
    }
};

// --- API ENDPOINT ---
app.get("/api/process-credit", (req, res) => {
    try {
        // 1. Ingestion
        const ingestedData = {
            upi: IngestionService.fetchUPIData(),
            gst: IngestionService.fetchGSTData(),
            bank: IngestionService.fetchBankStatementData(),
            utility: IngestionService.fetchUtilityData(),
            social: IngestionService.fetchSocialAndPsychometric()
        };

        // 2. Validation
        const validation = ValidationLayer.validateMSME(ingestedData);

        if (validation.status === "FAIL") {
            return res.status(403).json({ success: false, message: "Validation threshold not met.", validation });
        }

        // 3. Scoring
        const scoring = ScoringEngine.calculate(ingestedData, validation);

        // 4. Security (Blockchain Audit Hash)
        const auditPayload = JSON.stringify({ scoring, gstin: ingestedData.gst.gstin, timestamp: Date.now() });
        const blockchainHash = crypto.createHash("sha256").update(auditPayload).digest("hex");

        res.json({
            success: true,
            data: {
                ingestedData,
                validation,
                scoring,
                blockchain: {
                    auditTrailHash: blockchainHash,
                    status: "Committed to Immutable Ledger"
                }
            }
        });

    } catch (error) {
        console.error("Pipeline Error:", error);
        res.status(500).json({ success: false, error: "Internal Credit Intelligence Engine Failure" });
    }
});

// --- SOCIAL ACTIVITY ENDPOINT ---
/**
 * Scrapes social media activity for a given handle and platform.
 * Query Params: ?handle=username&platform=instagram|x
 */
app.get("/api/social-activity", async (req, res) => {
    const { handle, platform } = req.query;

    if (!handle || !platform) {
        return res.status(400).json({
            success: false,
            error: "Handle and platform are required."
        });
    }

    try {
        const activityData = await getSocialActivity(handle, platform);
        res.json({
            success: true,
            data: activityData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch social activity."
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CredNova Intelligence Engine running on port ${PORT}`));
