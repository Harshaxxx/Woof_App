import { useState, useRef, useEffect } from 'react';

export const useWalkSession = (externalPosition = null) => {
    const [isWalking, setIsWalking] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [distanceMeters, setDistanceMeters] = useState(0);
    const [coords, setCoords] = useState([]);
    const [startTime, setStartTime] = useState(null);

    const watchIdRef = useRef(null);
    const lastPositionRef = useRef(null);
    const timerRef = useRef(null);

    // Haversine formula to calculate distance in meters
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Handle external position updates
    useEffect(() => {
        if (isWalking && externalPosition) {
            const [lat, lon] = externalPosition;
            const newPoint = [lat, lon];
            const now = Date.now();

            if (!lastPositionRef.current) {
                // First point
                setCoords([newPoint]);
                lastPositionRef.current = { pos: newPoint, time: now };
            } else {
                const dist = calculateDistance(
                    lastPositionRef.current.pos[0],
                    lastPositionRef.current.pos[1],
                    lat,
                    lon
                );

                const timeDiff = (now - lastPositionRef.current.time) / 1000; // seconds
                const speed = timeDiff > 0 ? dist / timeDiff : 0; // meters per second

                // Smart Filter:
                // 1. Minimum movement: > 5m (avoids jitter)
                // 2. Maximum speed: < 25m/s (~55mph) (avoids teleportation glitches)
                // This allows long distances (e.g. 600m) ONLY if enough time has passed (e.g. tunnel)
                if (dist > 5 && speed < 25) {
                    setDistanceMeters(prev => prev + dist);
                    setCoords(prev => [...prev, newPoint]);
                    lastPositionRef.current = { pos: newPoint, time: now };
                }
            }
        }
    }, [externalPosition, isWalking]);

    const startWalk = () => {
        setIsWalking(true);
        setStartTime(new Date());
        setElapsedSeconds(0);
        setDistanceMeters(0);
        setCoords([]);
        lastPositionRef.current = externalPosition ? [...externalPosition] : null;

        // Start timer
        timerRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        // Only start internal watcher if NO external position is provided
        if (!externalPosition && navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPoint = [latitude, longitude];

                    setCoords(prev => [...prev, newPoint]);

                    if (lastPositionRef.current) {
                        const dist = calculateDistance(
                            lastPositionRef.current[0],
                            lastPositionRef.current[1],
                            latitude,
                            longitude
                        );
                        if (dist > 2) {
                            setDistanceMeters(prev => prev + dist);
                        }
                    }
                    lastPositionRef.current = newPoint;
                },
                (error) => console.error('Geolocation error:', error),
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        }
    };

    const endWalk = () => {
        // Stop watching and timer
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const endTime = new Date();
        const summary = {
            started_at: startTime,
            ended_at: endTime,
            distance_meters: Math.round(distanceMeters),
            duration_seconds: elapsedSeconds,
            path: coords
        };

        setIsWalking(false);
        return summary;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        isWalking,
        elapsedSeconds,
        distanceMeters,
        coords,
        startWalk,
        endWalk
    };
};
