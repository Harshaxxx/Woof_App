import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import WalkTracker from '../components/WalkTracker';
import { Navigation } from 'lucide-react';
import Button from '../components/Button';
import BoneDropMarker from '../components/BoneDropMarker';
import BoneCollectionModal from '../components/BoneCollectionModal';
import { useBoneDrops } from '../hooks/useBoneDrops';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const createEmojiIcon = (emoji) => L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${emoji}</div>`,
    className: 'custom-emoji-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const MapPage = () => {
    const { user } = useAuth();
    const [position, setPosition] = useState([40.7178, -74.0431]); // Default Jersey City
    const [locationName, setLocationName] = useState('Jersey City');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);

    // Bone drops management
    const { drops, nearbyDrop, collecting, collectDrop } = useBoneDrops(position, user?.id);

    // Show collection modal when near a drop
    useEffect(() => {
        if (nearbyDrop) {
            setShowCollectionModal(true);
        } else {
            setShowCollectionModal(false);
        }
    }, [nearbyDrop]);

    // Auto-seed drops if none exist nearby
    useEffect(() => {
        const checkAndSeedDrops = async () => {
            if (!position || drops.length > 0) return;

            // If we have position but no drops, try seeding
            console.log('No drops found, auto-seeding...');
            const { seedSharedDrops } = await import('../utils/seedBoneDrops');
            await seedSharedDrops(position[0], position[1]);
            // Refresh drops after seeding
            window.location.reload();
        };

        const timer = setTimeout(checkAndSeedDrops, 2000); // Wait 2s for initial fetch
        return () => clearTimeout(timer);
    }, [position, drops.length]);

    const handleCollect = async (dropId) => {
        const result = await collectDrop(dropId);
        if (result.success) {
            setShowCollectionModal(false);
        }
    };

    const safeZones = [
        { id: 1, pos: [40.7200, -74.0460], name: "Liberty State Park" },
    ];

    const buddies = [
        { id: 1, pos: [40.7170, -74.0400], name: "Luna" },
    ];

    // Continuous location tracking with jitter reduction
    useEffect(() => {
        let watchId;

        if (navigator.geolocation) {
            setLoadingLocation(true);

            // Use watchPosition to continuously refine location
            // distanceFilter: 10 prevents "jumping" by ignoring small changes (< 10m)
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude: lat, longitude: lon, accuracy } = pos.coords;
                    console.log(`Location update: ${lat}, ${lon} (Accuracy: ${accuracy}m)`);

                    setPosition([lat, lon]);
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLoadingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0,
                    distanceFilter: 10
                }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // Reverse geocode whenever position changes significantly
    useEffect(() => {
        const fetchLocationName = async () => {
            try {
                const [lat, lon] = position;
                // Skip default/initial position if needed, or just fetch

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
                    { headers: { 'User-Agent': 'WoofApp/1.0' } }
                );

                if (!response.ok) return;

                const data = await response.json();
                const newName = data.address?.neighbourhood ||
                    data.address?.suburb ||
                    data.address?.city ||
                    data.address?.town ||
                    'Your Location';

                setLocationName(newName);
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        };

        // Debounce slightly to avoid rapid API calls
        const timer = setTimeout(fetchLocationName, 1000);
        return () => clearTimeout(timer);
    }, [position]);

    const handleRecenter = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            // Force a single high-accuracy update immediately
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setLoadingLocation(false);
                },
                () => setLoadingLocation(false),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    };

    const RecenterMap = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(center);
        }, [center]);
        return null;
    };

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <RecenterMap center={position} />

                {/* User Marker */}
                <Marker position={position} icon={createEmojiIcon('🐕')}>
                    <Popup>You & Barnaby</Popup>
                </Marker>

                {/* Bone Drops */}
                {drops.map(drop => (
                    <BoneDropMarker
                        key={drop.id}
                        drop={drop}
                        userPosition={position}
                    />
                ))}

                {/* Safe Zones */}
                {safeZones.map(zone => (
                    <Marker key={zone.id} position={zone.pos} icon={createEmojiIcon('🌳')}>
                        <Popup>Safe Zone: {zone.name}</Popup>
                    </Marker>
                ))}

                {/* Buddies */}
                {buddies.map(buddy => (
                    <Marker key={buddy.id} position={buddy.pos} icon={createEmojiIcon('🐩')}>
                        <Popup>{buddy.name}</Popup>
                    </Marker>
                ))}

            </MapContainer>

            {/* Top Glass Header */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none' // Let clicks pass through around the pill
            }}>
                <div style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(12px)',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    pointerEvents: 'auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{locationName}</span>
                </div>
            </div>

            {/* Recenter Button - Positioned above the bottom panel */}
            <div style={{
                position: 'absolute',
                bottom: '180px', // Moved up to clear the new bottom panel
                right: '20px',
                zIndex: 1000
            }}>
                <Button
                    onClick={handleRecenter}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(20, 20, 20, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                >
                    <Navigation
                        size={20}
                        className={loadingLocation ? 'animate-spin' : ''}
                        fill={loadingLocation ? 'none' : 'currentColor'}
                    />
                </Button>
            </div>

            {/* Bone Collection Modal */}
            {showCollectionModal && nearbyDrop && (
                <BoneCollectionModal
                    drop={nearbyDrop}
                    onCollect={handleCollect}
                    onClose={() => setShowCollectionModal(false)}
                    collecting={collecting}
                />
            )}

            <WalkTracker userPosition={position} />
        </div>
    );
};

export default MapPage;
