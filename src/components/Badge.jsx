import React from 'react';

const Badge = ({ icon, name, unlocked = false }) => {
    return (
        <div className="text-center" style={{
            opacity: unlocked ? 1 : 0.5,
            filter: unlocked ? 'none' : 'grayscale(100%)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: unlocked
                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                    : 'var(--color-surface)',
                border: `2px solid ${unlocked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: unlocked ? 'var(--shadow-glow)' : 'none'
            }}>
                {icon}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{name}</p>
        </div>
    );
};

export default Badge;
