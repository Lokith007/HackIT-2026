/**
 * Social Trust Score Routes
 *
 * POST /social/connect                     — Submit profile URLs + compute social score
 * GET  /social/oauth/:platform/callback    — OAuth callback handler for each platform
 */
const { Router } = require('express');
const { handleConnect, handleOAuthCallback } = require('../controllers/socialController');

const router = Router();

/**
 * POST /social/connect
 * Submit profile URLs for LinkedIn, X, Instagram, YouTube
 * and receive an anonymized social trust score.
 */
router.post('/social/connect', handleConnect);

/**
 * GET /social/oauth/:platform/callback
 * OAuth redirect callback handler for each social platform.
 * Platform: linkedin | twitter | instagram | youtube
 */
router.get('/social/oauth/:platform/callback', handleOAuthCallback);

module.exports = router;
