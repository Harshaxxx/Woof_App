import React from 'react';
import Card from './Card';
import Button from './Button';

const PackCard = ({ name, members, location, image, joined = false, onJoin }) => {
    return (
        <Card className="flex items-center gap-md" style={{ padding: '15px' }}>
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'var(--color-surface)',
                backgroundImage: `url(${image})`, // In real app
                backgroundSize: 'cover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '1px solid var(--color-border)'
            }}>
                {/* Placeholder emoji if no image */}
                {!image && '🐾'}
            </div>

            <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: '4px' }}>{name}</h4>
                <p className="text-sm text-muted" style={{ marginBottom: '4px' }}>{members} Members • {location}</p>
                <div className="flex" style={{ gap: '-8px' }}>
                    {/* Micro-avatars of members could go here */}
                </div>
            </div>

            <Button
                variant={joined ? "secondary" : "primary"}
                onClick={onJoin}
                style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    minWidth: '80px'
                }}
            >
                {joined ? "Joined" : "Join"}
            </Button>
        </Card>
    );
};

export default PackCard;
