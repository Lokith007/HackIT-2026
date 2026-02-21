/**
 * Social Service — Orchestrator
 *
 * Coordinates OAuth flows, metadata fetching, and score computation
 * across LinkedIn, X (Twitter), Instagram, and YouTube.
 *
 * Privacy-first: No personal content, captions, comments, messages,
 * or raw usernames/handles are stored. Only anonymized sessionId,
 * calculated socialScore, and timestamp are persisted.
 */
const { v4: uuidv4 } = require('uuid');
const socialScoreModel = require('../models/socialScoreModel');
const { validateAllUrls } = require('../utils/urlValidator');
const { calculateSocialScore } = require('../utils/socialScoreCalculator');
const linkedinService = require('./linkedinService');
const twitterService = require('./twitterService');
const instagramService = require('./instagramService');
const youtubeService = require('./youtubeService');

// Map platform names to their service modules
const PLATFORM_SERVICES = {
    linkedin: linkedinService,
    twitter: twitterService,
    instagram: instagramService,
    youtube: youtubeService,
};

// ─── Initialization ────────────────────────────────────────────────

let initialized = false;

/**
 * Initializes the social score database table.
 */
async function init() {
    try {
        await socialScoreModel.initTable();
        initialized = true;
        console.log('[SocialService] Initialized successfully.');
    } catch (err) {
        console.warn('[SocialService] Init warning (DB may be offline):', err.message);
        initialized = false;
    }
}

// ─── OAuth URL Generation ──────────────────────────────────────────

/**
 * Generates OAuth authorization URLs for requested platforms.
 *
 * @param {string[]} platforms - Platforms to generate URLs for.
 * @param {string} sessionId  - Session identifier for state tracking.
 * @returns {Object} Map of platform → authUrl.
 */
function getOAuthUrls(platforms, sessionId) {
    const urls = {};
    for (const platform of platforms) {
        const service = PLATFORM_SERVICES[platform];
        if (!service) continue;

        if (platform === 'twitter') {
            const pkce = twitterService.generatePKCE();
            urls[platform] = {
                authUrl: service.getAuthUrl(sessionId, pkce.codeChallenge),
                codeVerifier: pkce.codeVerifier,
            };
        } else {
            urls[platform] = {
                authUrl: service.getAuthUrl(sessionId),
            };
        }
    }
    return urls;
}

// ─── Core: Connect + Score ─────────────────────────────────────────

/**
 * Main orchestration function.
 * Validates URLs, fetches metadata from each platform (dev mode if no real OAuth),
 * computes social score, and persists anonymized result.
 *
 * @param {Object} profileUrls - Map of platform → profile URL.
 * @returns {Promise<Object>} Result with socialScore.
 */
async function connectAndScore(profileUrls) {
    // 1. Validate all URLs
    const validation = validateAllUrls(profileUrls);

    // Allow partial — proceed with whatever validated successfully
    const validPlatforms = Object.keys(validation.validated);

    if (validPlatforms.length === 0) {
        return {
            success: false,
            message: 'No valid profile URLs provided.',
            errors: validation.errors,
        };
    }

    // 2. Generate anonymized session ID (UUID v4)
    const sessionId = uuidv4();

    // 3. Fetch metadata from each valid platform
    const platformData = {};
    const platformStatus = {};
    const warnings = [];

    const fetchPromises = validPlatforms.map(async (platform) => {
        try {
            const service = PLATFORM_SERVICES[platform];
            if (!service) {
                platformStatus[platform] = 'UNSUPPORTED';
                return;
            }

            // In dev mode (no real OAuth credentials), use sample data
            if (!service.isConfigured()) {
                console.log(`[SocialService] ${platform}: No OAuth credentials, using sample data.`);
                platformData[platform] = service.generateSampleData();
                platformStatus[platform] = 'SAMPLE_DATA';
                return;
            }

            // With real credentials, we'd need the OAuth callback flow.
            // For direct API mode, attempt metadata fetch with stored tokens.
            // For now, fall back to sample data in development.
            platformData[platform] = service.generateSampleData();
            platformStatus[platform] = 'DEV_MODE';
        } catch (err) {
            console.error(`[SocialService] ${platform} fetch failed:`, err.message);
            platformStatus[platform] = 'FAILED';
            warnings.push(`${platform}: ${err.message}`);
        }
    });

    await Promise.all(fetchPromises);

    // 4. Check if we got any data
    const platformsWithData = Object.keys(platformData);
    if (platformsWithData.length === 0) {
        return {
            success: false,
            message: 'Failed to fetch metadata from any platform.',
            platformStatus,
            errors: warnings,
        };
    }

    // 5. Compute social score
    const scoreResult = calculateSocialScore(platformData);

    // 6. Persist anonymized score (no PII)
    let dbRecord = null;
    try {
        dbRecord = await socialScoreModel.insertScore(
            sessionId,
            scoreResult.socialScore,
            platformsWithData,
        );
    } catch (err) {
        console.warn('[SocialService] DB insert failed (continuing without persistence):', err.message);
    }

    // 7. Build response
    const response = {
        success: true,
        data: {
            socialScore: scoreResult.socialScore,
            sessionId,
            platformsAnalyzed: platformsWithData,
            platformStatus,
            metrics: {
                networkSize: scoreResult.metrics.networkSize,
                postFrequency: scoreResult.metrics.postFrequency,
                accountAgeDays: scoreResult.metrics.accountAgeDays,
                interactionRate: scoreResult.metrics.interactionRate,
            },
            normalized: scoreResult.normalized,
            timestamp: dbRecord?.created_at || new Date().toISOString(),
        },
    };

    // Include non-critical warnings
    if (warnings.length > 0) {
        response.data.warnings = warnings;
    }
    if (validation.errors.length > 0) {
        response.data.validationWarnings = validation.errors;
    }

    return response;
}

// ─── OAuth Callback Handler ────────────────────────────────────────

/**
 * Handles OAuth callback for a specific platform.
 * Exchanges code for token and fetches metadata.
 *
 * @param {string} platform     - Platform name.
 * @param {string} code         - Authorization code.
 * @param {string} [codeVerifier] - PKCE verifier (Twitter only).
 * @returns {Promise<Object>} Platform metadata.
 */
async function handleOAuthCallback(platform, code, codeVerifier) {
    const service = PLATFORM_SERVICES[platform?.toLowerCase()];
    if (!service) {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    let accessToken;
    if (platform === 'twitter') {
        accessToken = await service.exchangeCode(code, codeVerifier);
    } else {
        accessToken = await service.exchangeCode(code);
    }

    const metadata = await service.fetchMetadata(accessToken);
    return metadata;
}

module.exports = {
    init,
    connectAndScore,
    getOAuthUrls,
    handleOAuthCallback,
};
