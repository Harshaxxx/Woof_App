import React from 'react';
import Card from './Card';
import Button from './Button';

const MissionCard = ({
    title,
    reward,
    progress,
    total,
    icon,
    color = 'var(--color-primary)',
    onClaim
}) => {
    const isComplete = progress >= total;
    const percent = Math.min((progress / total) * 100, 100);

    return (
        <Card className="flex items-center justify-between gap-md">
            <div className="flex items-center gap-md" style={{ flex: 1 }}>
                <div style={{
                    fontSize: '2rem',
                    background: `rgba(0,0,0,0.2)`,
                    borderRadius: '12px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>

                <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '4px' }}>{title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            color: 'var(--color-accent)'
                        }}>
                            +{reward} Bones
                        </span>
                        <span className="text-sm text-muted">• {progress}/{total}</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                        height: '6px',
                        background: 'var(--color-bg)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        width: '100%'
                    }}>
                        <div style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: color,
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            </div>

            <div>
                {isComplete ? (
                    <Button
                        onClick={onClaim}
                        style={{
                            padding: '8px 16px',
                            fontSize: '0.9rem',
                            background: 'var(--color-accent)',
                            color: '#000'
                        }}
                    >
                        Claim
                    </Button>
                ) : (
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '2px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)'
                    }}>
                        🔒
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MissionCard;
