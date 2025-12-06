import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create a glowing bone icon
const createGlowingBoneIcon = (boneValue, isPersonal = false) => {
    const color = isPersonal ? '#FFD700' : '#FFB800'; // Gold for personal, amber for shared
    const size = isPersonal ? 32 : 40;

    return L.divIcon({
        html: `
            <div class="bone-drop-marker" style="
                font-size: ${size}px;
                filter: drop-shadow(0 0 10px ${color});
                animation: bone-glow 2s ease-in-out infinite;
                cursor: pointer;
                position: relative;
            ">
                🦴
                ${boneValue > 50 ? `<div style="
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #FF6B6B;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">💎</div>` : ''}
            </div>
        `,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

const BoneDropMarker = ({ drop, onNearDrop, userPosition }) => {
    const isPersonal = drop.type === 'personal';
    const icon = createGlowingBoneIcon(drop.bone_value, isPersonal);

    return (
        <Marker
            position={[drop.latitude, drop.longitude]}
            icon={icon}
            eventHandlers={{
                click: () => {
                    if (onNearDrop) {
                        onNearDrop(drop);
                    }
                }
            }}
        >
            <Popup>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)' }}>
                        {drop.bone_value} Bones 🦴
                    </h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                        {drop.location_name || 'Bone Drop'}
                    </p>
                    <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {isPersonal ? '🎁 Personal Drop' : '🌍 Community Drop'}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
};

export default BoneDropMarker;
