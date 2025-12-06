import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Bone, Users, User } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Feed', icon: Home },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/store', label: 'Store', icon: Bone },
    { path: '/packs', label: 'Pack', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: '20px', paddingBottom: '80px' }}>
      {children}

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(21, 26, 53, 0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: 'var(--radius-lg)',
                background: isActive ? 'rgba(255, 184, 0, 0.1)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '600',
                gap: '4px',
                transition: 'all var(--transition-base)',
                position: 'relative'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
                  borderRadius: '0 0 3px 3px',
                  boxShadow: '0 0 10px var(--color-primary)'
                }} />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
