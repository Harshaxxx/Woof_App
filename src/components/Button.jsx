import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled = false,
  style = {}
}) => {
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all var(--transition-base)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
      color: '#000000',
      boxShadow: 'var(--shadow-glow)',
    },
    secondary: {
      background: 'var(--color-surface-elevated)',
      color: 'var(--color-text-main)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'linear-gradient(135deg, var(--color-danger), #E63946)',
      color: '#ffffff',
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...baseStyles, ...variants[variant] }}
      className={className}
      disabled={disabled}
      onMouseOver={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 184, 0, 0.5)';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
