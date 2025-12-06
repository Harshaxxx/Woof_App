import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { calculateDistance } from '../utils/boneDrops';

const COLLECTION_RADIUS = 30; // meters

export const useBoneDrops = (userPosition, userId) => {
    const [drops, setDrops] = useState([]);
    const [nearbyDrop, setNearbyDrop] = useState(null);
    const [collecting, setCollecting] = useState(false);

    // Fetch bone drops from database
    const fetchDrops = async () => {
        if (!supabase || !userPosition) return;

        try {
            const { data, error } = await supabase
                .from('bone_drops')
                .select('*')
                .is('collected_by', null)
                .gt('expires_at', new Date().toISOString());

            if (error) throw error;

            // Filter drops to only show those within 1 km
            const radiusMeters = 1000; // 1 km in meters
            const [userLat, userLon] = userPosition;

            const nearbyDrops = (data || []).filter(drop => {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    drop.latitude,
                    drop.longitude
                );
                return distance <= radiusMeters;
            });

            // Sort by distance and limit to 3 drops max
            const limitedDrops = nearbyDrops
                .sort((a, b) => {
                    const distA = calculateDistance(userLat, userLon, a.latitude, a.longitude);
                    const distB = calculateDistance(userLat, userLon, b.latitude, b.longitude);
                    return distA - distB;
                })
                .slice(0, 3);

            setDrops(limitedDrops);
        } catch (error) {
            console.error('Error fetching bone drops:', error);
        }
    };

    // Check if user is near any drops
    useEffect(() => {
        if (!userPosition || drops.length === 0) {
            setNearbyDrop(null);
            return;
        }

        const [userLat, userLon] = userPosition;

        // Find the closest drop within collection radius
        let closest = null;
        let minDistance = Infinity;

        drops.forEach(drop => {
            const distance = calculateDistance(
                userLat,
                userLon,
                drop.latitude,
                drop.longitude
            );

            if (distance <= COLLECTION_RADIUS && distance < minDistance) {
                minDistance = distance;
                closest = { ...drop, distance };
            }
        });

        setNearbyDrop(closest);
    }, [userPosition, drops]);

    // Collect a bone drop
    const collectDrop = async (dropId) => {
        if (!userId || !supabase || collecting) return;

        setCollecting(true);

        try {
            // Update the drop in database
            const { error: updateError } = await supabase
                .from('bone_drops')
                .update({
                    collected_by: userId,
                    collected_at: new Date().toISOString()
                })
                .eq('id', dropId)
                .is('collected_by', null); // Ensure it hasn't been collected yet

            if (updateError) throw updateError;

            // Find the drop to get its value
            const drop = drops.find(d => d.id === dropId);
            if (!drop) throw new Error('Drop not found');

            // Add bones to wallet
            const { data: wallet } = await supabase
                .from('bone_wallets')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (wallet) {
                await supabase
                    .from('bone_wallets')
                    .update({ balance: wallet.balance + drop.bone_value })
                    .eq('user_id', userId);
            } else {
                await supabase
                    .from('bone_wallets')
                    .insert({ user_id: userId, balance: drop.bone_value });
            }

            // Add transaction record
            await supabase
                .from('bone_transactions')
                .insert({
                    user_id: userId,
                    amount: drop.bone_value,
                    type: 'drop_collect',
                    meta: { drop_id: dropId, drop_type: drop.type }
                });

            // Remove from local state
            setDrops(drops.filter(d => d.id !== dropId));
            setNearbyDrop(null);

            setCollecting(false);
            return { success: true, bonesEarned: drop.bone_value };

        } catch (error) {
            console.error('Error collecting drop:', error);
            setCollecting(false);
            return { success: false, error: error.message };
        }
    };

    // Fetch drops on mount and when position changes significantly
    useEffect(() => {
        fetchDrops();
    }, [userPosition]);

    return {
        drops,
        nearbyDrop,
        collecting,
        collectDrop,
        refreshDrops: fetchDrops
    };
};
