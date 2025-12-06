import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Load env vars manually since we are running a script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndSeed() {
    console.log('Checking packs...');
    const { data: packs, error } = await supabase.from('packs').select('*');

    if (error) {
        console.error('Error fetching packs:', error);
        return;
    }

    console.log('Current packs in DB:', packs.length);
    packs.forEach(p => console.log(`- ${p.id}: ${p.name} (${p.city})`));

    if (packs.length === 0) {
        console.log('Seeding packs...');
        const mockPacks = [
            { name: 'Liberty State Park Pack', city: 'Jersey City', member_count: 56, description: 'Morning runs by the Statue of Liberty! 🗽' },
            { name: 'Hoboken Waterfront Pups', city: 'Hoboken', member_count: 89, description: 'Pier A & Sinatra Park meetups.' },
            { name: 'Central Park Explorers', city: 'New York City', member_count: 124, description: 'The biggest pack in the Big Apple.' },
            { name: 'Hamilton Park Hounds', city: 'Jersey City', member_count: 34, description: 'Small dogs, big personalities.' },
            { name: 'Washington Square Woofs', city: 'New York City', member_count: 78, description: 'Music, squirrels, and vibes.' },
        ];

        const { data: newPacks, error: insertError } = await supabase.from('packs').insert(mockPacks).select();
        if (insertError) {
            console.error('Error seeding packs:', insertError);
        } else {
            console.log('Seeded packs:', newPacks);
        }
    } else {
        // Check if we need to update them to the new locations?
        // For now, let's just see what's there.
    }
}

checkAndSeed();
