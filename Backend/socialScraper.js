const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Scrapes public profile data and calculates an activity score.
 * Note: This is a hackathon-ready implementation focusing on public metrics.
 */
async function getSocialActivity(handle, platform) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        let url = '';
        if (platform === 'instagram') {
            url = `https://www.instagram.com/${handle}/`;
        } else if (platform === 'x' || platform === 'twitter') {
            url = `https://x.com/${handle}`;
        } else {
            throw new Error('Unsupported platform');
        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for profile content to load
        // This is a generic selector-based mock/scraper that would need fine-tuning for specific DOMs
        // In a real-world scenario, we'd use robust selectors or specialized APIs.
        
        const data = await page.evaluate((plat) => {
            const result = {
                followers: 0,
                posts: 0,
                lastPostDaysAgo: 0,
                isBusiness: false
            };

            if (plat === 'instagram') {
                // Example Instagram extraction (dynamic)
                const metaTags = document.querySelectorAll('meta[property="og:description"]');
                if (metaTags.length > 0) {
                    const desc = metaTags[0].content;
                    // Format: "1.2M Followers, 300 Following, 1,500 Posts..."
                    const match = desc.match(/([\d,.KMB]+)\s+Followers/);
                    if (match) result.followers = match[1];
                    const postMatch = desc.match(/([\d,.KMB]+)\s+Posts/);
                    if (postMatch) result.posts = postMatch[1];
                }
            } else {
                // X extraction
                // This is often harder due to shadow DOM / dynamic IDs, so we look for common patterns
                const text = document.body.innerText;
                const followMatch = text.match(/([\d,.KMB]+)\s+Followers/);
                if (followMatch) result.followers = followMatch[1];
            }

            return result;
        }, platform);

        // Simulated/Calculated Activity Score for demo purposes
        // In a real implementation, we'd calculate this from actual timestamps
        const activityScore = Math.floor(Math.random() * 40) + 60; // Mock score between 60-100 for active handles

        return {
            handle,
            platform,
            ...data,
            activityScore,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`Scraping error for ${handle} on ${platform}:`, error.message);
        return {
            handle,
            platform,
            error: error.message,
            activityScore: 0
        };
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { getSocialActivity };
