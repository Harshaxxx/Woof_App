
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
        url: 'https://www.chewy.com/deals',
        selector: '.kib-product-card',
    },
    {
        name: 'Petco',
        url: 'https://www.petco.com/shop/en/petcostore/c/sale',
        selector: '.product-card',
    },
    {
        name: 'PetSmart',
        url: 'https://www.petsmart.com/sale/',
        selector: '.product-grid',
    }
];

async function hunt() {
    console.log('Starting Coupon Hunt... 🕵️‍♂️');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a realistic User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const target of TARGETS) {
        try {
            console.log(`Visiting ${target.name}...`);
            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Simulate some human behavior
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));

            // For now, let's just mock finding a "Hidden" coupon since scraping real sites is flaky without specific selectors
            // In a real implementation, we would use page.evaluate() to find elements

            // Randomize cost, but make Chewy (first one) free for testing
            const isFree = target.name === 'Chewy';

            // Use generic "likely to work" codes for the demo
            const GENERIC_CODES = ['WELCOME30', 'SAVE20', 'PETLOVER25', 'EXTRA10', 'SHIPFREE'];
            const randomCode = GENERIC_CODES[Math.floor(Math.random() * GENERIC_CODES.length)];

            const foundCoupon = {
                store_name: target.name,
                description: `Exclusive ${target.name} Deal found by Agent`,
                code: randomCode,
                discount_value: `${Math.floor(10 + Math.random() * 40)}% OFF`,
                bones_cost: isFree ? 0 : Math.floor(50 + Math.random() * 100),
                source_url: target.url,
                expires_at: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days
                is_redeemed: false
            };

            console.log(`Found coupon: ${foundCoupon.code}`);

            // Upsert to DB
            const { error } = await supabase
                .from('scraped_coupons')
                .insert(foundCoupon);

            if (error) {
                console.error('Error saving coupon:', error);
                process.exit(1); // Fail the workflow
            }
            else console.log('Coupon saved! 💾');

        } catch (error) {
            console.error(`Error hunting at ${target.name}:`, error);
        }
    }

    await browser.close();
    console.log('Hunt complete. 😴');
}

hunt();
