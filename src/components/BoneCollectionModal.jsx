import React from 'react';
import Button from './Button';

const BoneCollectionModal = ({ drop, onCollect, onClose, collecting }) => {
    if (!drop) return null;

    const isPersonal = drop.type === 'personal';

    return (
        <div style={{
            position: 'fixed',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{
                background: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                padding: '24px',
                border: `2px solid ${isPersonal ? '#FFD700' : 'var(--color-primary)'}`,
                boxShadow: `0 10px 40px ${isPersonal ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 184, 0, 0.3)'}`,
                minWidth: '280px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '3rem',
                    marginBottom: '12px',
                    animation: 'bone-glow 1.5s ease-in-out infinite'
                }}>
                    🦴
                </div>

                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    color: isPersonal ? '#FFD700' : 'var(--color-primary)'
                }}>
                    {drop.bone_value} Bones!
                </h3>

                <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '0.9rem',
                    color: 'var(--color-text-muted)'
                }}>
                    {drop.location_name || 'Bone Drop'}
                </p>

                {drop.distance !== undefined && (
                    <p style={{
                        margin: '0 0 16px 0',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        📍 {Math.round(drop.distance)}m away
                    </p>
                )}

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '20px'
                }}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px'
                        }}
                        disabled={collecting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onCollect(drop.id)}
                        style={{
                            flex: 2,
                            padding: '12px',
                            borderRadius: '12px',
                            background: isPersonal ? '#FFD700' : 'var(--color-primary)',
                            color: 'black',
                            fontWeight: 'bold'
                        }}
                        disabled={collecting}
                    >
                        {collecting ? 'Collecting...' : '✨ Collect Bones'}
                    </Button>
                </div>

                <p style={{
                    margin: '12px 0 0 0',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {isPersonal ? '🎁 Personal Drop' : '🌍 Community Drop'}
                </p>
            </div>
        </div>
    );
};

export default BoneCollectionModal;
