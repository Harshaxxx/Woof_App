import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Environment variables will be injected by GitHub Actions
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGETS = [
    {
        name: 'Chewy',
        url: 'https://couponfollow.com/site/chewy.com',
        storeUrl: 'https://www.chewy.com',
        selector: 'article.offer-card',
    },
    {
        name: 'Petco',
        url: 'https://couponfollow.com/site/petco.com',
        storeUrl: 'https://www.petco.com',
        selector: 'article.offer-card',
    },
    {
        name: 'PetSmart',
        url: 'https://couponfollow.com/site/petsmart.com',
        storeUrl: 'https://www.petsmart.com',
        selector: 'article.offer-card',
    }
];

async function hunt() {
    console.log('Starting Coupon Hunt... 🕵️‍♂️');

    // 1. Cleanup Expired Coupons
    try {
        console.log('Cleaning up expired coupons... 🧹');
        const { error: deleteError } = await supabase
            .from('scraped_coupons')
            .delete()
            .lt('expires_at', new Date().toISOString());

        if (deleteError) console.error('Error cleaning up:', deleteError);
        else console.log('Expired coupons removed.');
    } catch (err) {
        console.error('Cleanup failed:', err);
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a realistic User-Agent and Viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    for (const target of TARGETS) {
        try {
            console.log(`Visiting ${target.name} on CouponFollow...`);
            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for coupons to load
            try {
                await page.waitForSelector('article.offer-card', { timeout: 5000 });
            } catch (e) {
                console.log(`Timeout waiting for selector on ${target.name}`);
            }

            // Scrape coupons
            const coupons = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('article.offer-card'));
                return items.slice(0, 5).map(item => { // Get top 5
                    const title = item.querySelector('.title')?.innerText || item.innerText.split('\n')[0];
                    const verified = item.innerText.includes('Verified');

                    // NEW SELECTOR: Get text from .code span
                    const codeSpan = item.querySelector('.code');
                    const code = codeSpan ? codeSpan.innerText.trim() : null;

                    return {
                        description: title,
                        code: code,
                        isVerified: verified,
                        discount: item.innerText.match(/(\d+% OFF|\$\d+ OFF)/i)?.[0] || 'Special Deal'
                    };
                });
            });

            // Process found coupons
            for (const coupon of coupons) {
                let finalCode = coupon.code;

                // STRICT VALIDATION: If no code found, SKIP IT.
                // Do NOT use generic fallbacks as they lead to bad user experience.
                if (!finalCode) {
                    console.log(`Skipping deal "${coupon.description}" - No code found. ❌`);
                    continue;
                }

                // Clean up code (remove spaces, etc)
                finalCode = finalCode.trim().toUpperCase();

                // STRICTER VALIDATION: Only accept VERIFIED codes
                if (!coupon.isVerified) {
                    console.log(`Skipping unverified code for ${target.name}: ${finalCode} ⚠️`);
                    continue;
                }

                // FILTER SHORT CODES: Likely partials or errors (e.g., "VE7", "R20")
                // Relaxed to 3 chars because "U15" and "R20" might be valid for some stores
                if (finalCode.length < 3) {
                    console.log(`Skipping very short code for ${target.name}: ${finalCode} ⚠️`);
                    continue;
                }

                console.log(`Found VERIFIED code for ${target.name}: ${finalCode} ✅`);

                const couponData = {
                    store_name: target.name,
                    description: coupon.description,
                    code: finalCode,
                    discount_value: coupon.discount,
                    bones_cost: coupon.isVerified ? Math.floor(100 + Math.random() * 100) : Math.floor(50 + Math.random() * 50), // Verified costs more
                    source_url: target.storeUrl, // Use direct store URL
                    expires_at: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days
                    is_redeemed: false
                };

                // Upsert to DB
                const { error } = await supabase
                    .from('scraped_coupons')
                    .insert(couponData);

                if (error) {
                    console.error('Error saving coupon:', error);
                } else {
                    // 50% chance to generate a "Loser" card for this store to make it interesting
                    if (Math.random() > 0.5) {
                        console.log(`Adding a mystery dud for ${target.name}... 😈`);
                        await supabase.from('scraped_coupons').insert({
                            store_name: target.name,
                            description: 'Mystery Deal',
                            code: 'NO-LUCK',
                            discount_value: 'No Prize',
                            bones_cost: Math.floor(20 + Math.random() * 30), // Cheaper to scratch
                            source_url: target.storeUrl,
                            expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
                            is_redeemed: false
                        });
                    }
                }
            }

        } catch (error) {
            console.error(`Error hunting at ${target.name}:`, error);
        }
    }

    await browser.close();
    console.log('Hunt complete. 😴');
}

hunt();
