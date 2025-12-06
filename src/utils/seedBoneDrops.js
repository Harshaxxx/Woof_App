import { supabase } from '../supabaseClient';
import { SAFE_PARKS, getParksWithinRadius, generateBoneValue, getNextMidnight } from '../utils/boneDrops';

// Generate shared bone drops at parks near the user
export const seedSharedDrops = async (userLat, userLon) => {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }

    try {
        // Get parks within 1 km (approx 0.62 miles) of user
        let nearbyParks = getParksWithinRadius(userLat, userLon, 0.62);
        let useRandomLocations = false;

        if (nearbyParks.length === 0) {
            console.log('No known parks found within 1 km. Generating random street drops.');
            useRandomLocations = true;
            // Create fake "park" locations around the user for testing
            nearbyParks = [
                { name: 'Nearby Spot', lat: userLat, lon: userLon },
                { name: 'Local Corner', lat: userLat, lon: userLon },
                { name: 'Hidden Gem', lat: userLat, lon: userLon }
            ];
        }

        // Generate 2-3 shared drops
        const numDrops = Math.floor(Math.random() * 2) + 2;
        const drops = [];

        for (let i = 0; i < numDrops; i++) {
            const park = nearbyParks[i % nearbyParks.length];

            // Generate random offset within ~200-500 meters
            // 0.001 degrees is approx 111 meters
            // We want drops to be visible but require walking
            const latOffset = (Math.random() - 0.5) * 0.006;
            const lonOffset = (Math.random() - 0.5) * 0.006;

            drops.push({
                type: 'shared',
                latitude: park.lat + latOffset,
                longitude: park.lon + lonOffset,
                location_name: useRandomLocations ? 'Mystery Drop' : park.name,
                bone_value: generateBoneValue('shared'),
                expires_at: getNextMidnight()
            });
        }

        const { data, error } = await supabase
            .from('bone_drops')
            .insert(drops)
            .select();

        if (error) throw error;

        console.log(`✅ Created ${data.length} shared bone drops near you!`);
        return data;

    } catch (error) {
        console.error('Error seeding shared drops:', error);
        return null;
    }
};

// Generate a personal drop for a specific user
export const seedPersonalDrop = async (userId, userLat, userLon) => {
    if (!supabase || !userId) {
        console.error('Supabase client not initialized or no user ID');
        return;
    }

    try {
        // Get parks within 1 km (approx 0.62 miles)
        const nearbyParks = getParksWithinRadius(userLat, userLon, 0.62);

        if (nearbyParks.length === 0) {
            console.log('No parks found within 1 km for personal drop');
            return null;
        }

        // Pick a random nearby park
        const park = nearbyParks[Math.floor(Math.random() * nearbyParks.length)];

        // Add random offset
        const latOffset = (Math.random() - 0.5) * 0.001;
        const lonOffset = (Math.random() - 0.5) * 0.001;

        const drop = {
            type: 'personal',
            latitude: park.lat + latOffset,
            longitude: park.lon + lonOffset,
            location_name: park.name,
            bone_value: generateBoneValue('personal'),
            user_id: userId,
            expires_at: getNextMidnight()
        };

        const { data, error } = await supabase
            .from('bone_drops')
            .insert([drop])
            .select();

        if (error) throw error;

        console.log(`✅ Created personal drop for user ${userId}!`);
        return data[0];

    } catch (error) {
        console.error('Error seeding personal drop:', error);
        return null;
    }
};

// Clear all expired drops
export const clearExpiredDrops = async () => {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }

    try {
        const { error } = await supabase
            .from('bone_drops')
            .delete()
            .lt('expires_at', new Date().toISOString());

        if (error) throw error;

        console.log('✅ Cleared expired drops!');

    } catch (error) {
        console.error('Error clearing expired drops:', error);
    }
};

// Daily reset: Clear old drops and create new ones
export const dailyReset = async (userLat, userLon, userId = null) => {
    console.log('🔄 Starting daily bone drop reset...');

    await clearExpiredDrops();

    if (userLat && userLon) {
        await seedSharedDrops(userLat, userLon);

        if (userId) {
            await seedPersonalDrop(userId, userLat, userLon);
        }
    }

    console.log('✅ Daily reset complete!');
};
