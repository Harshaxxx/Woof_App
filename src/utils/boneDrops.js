// Haversine formula to calculate distance between two coordinates in meters
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Safe park locations in Jersey City, Hoboken, and NYC area
export const SAFE_PARKS = [
    // Jersey City
    { name: 'Liberty State Park', lat: 40.7059, lon: -74.0565 },
    { name: 'Van Vorst Park', lat: 40.7198, lon: -74.0463 },
    { name: 'Hamilton Park', lat: 40.7201, lon: -74.0400 },
    { name: 'Lincoln Park', lat: 40.7328, lon: -74.0756 },

    // Hoboken
    { name: 'Pier A Park', lat: 40.7353, lon: -74.0297 },
    { name: 'Church Square Park', lat: 40.7422, lon: -74.0307 },
    { name: 'Elysian Park', lat: 40.7451, lon: -74.0258 },

    // NYC
    { name: 'Battery Park', lat: 40.7033, lon: -74.0170 },
    { name: 'Washington Square Park', lat: 40.7308, lon: -73.9973 },
    { name: 'Union Square Park', lat: 40.7359, lon: -73.9911 },
    { name: 'Madison Square Park', lat: 40.7422, lon: -73.9877 },
    { name: 'Bryant Park', lat: 40.7536, lon: -73.9832 },
    { name: 'Central Park South', lat: 40.7678, lon: -73.9718 },
];

// Get parks within a certain radius (in miles)
export const getParksWithinRadius = (userLat, userLon, radiusMiles) => {
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters

    return SAFE_PARKS.filter(park => {
        const distance = calculateDistance(userLat, userLon, park.lat, park.lon);
        return distance <= radiusMeters;
    });
};

// Generate random bone value based on drop type
export const generateBoneValue = (type) => {
    if (type === 'shared') {
        // Higher value: 20-100 bones
        return Math.floor(Math.random() * 81) + 20;
    } else {
        // Lower value: 5-20 bones
        return Math.floor(Math.random() * 16) + 5;
    }
};

// Get random park from a list
export const getRandomPark = (parks) => {
    if (parks.length === 0) return null;
    return parks[Math.floor(Math.random() * parks.length)];
};

// Check if a drop has expired
export const isDropExpired = (drop) => {
    return new Date(drop.expires_at) < new Date();
};

// Generate expiration time (daily reset at midnight)
export const getNextMidnight = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
};

// Generate random time between 8am and 6pm for personal drops
export const getRandomTimeToday = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Random hour between 8 (8am) and 18 (6pm)
    const randomHour = Math.floor(Math.random() * 10) + 8;
    const randomMinute = Math.floor(Math.random() * 60);

    today.setHours(randomHour, randomMinute, 0, 0);

    // If the time has already passed today, return null (will be generated tomorrow)
    if (today < now) {
        return null;
    }

    return today.toISOString();
};
