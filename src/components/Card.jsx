import React from 'react';

const Card = ({ children, className = '', style = {}, onClick }) => {
    const cardStyles = {
        background: 'rgba(30, 37, 66, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)',
        transition: 'all var(--transition-base)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
    };

    return (
        <div
            style={cardStyles}
            className={`card ${className}`}
            onClick={onClick}
            onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            {children}
        </div>
    );
};

export default Card;
