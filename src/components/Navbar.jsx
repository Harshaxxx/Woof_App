import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <span className="logo-icon">🐾</span>
                    <span className="logo-text">Woof</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to="/explore" className="nav-item">Explore</Link>
                    <Link to="/notifications" className="nav-item">Notifications</Link>
                </div>

                <div className="user-actions">
                    <button className="btn btn-primary">New Bark</button>
                    <Link to="/profile" className="user-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </Link>
                </div>
            </div>

            <style>{`
        .navbar {
          background-color: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: var(--spacing-sm) 0;
        }
        
        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .nav-links {
          display: flex;
          gap: var(--spacing-xl);
        }
        
        .nav-item {
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: color 0.2s;
        }
        
        .nav-item:hover, .nav-item.active {
          color: var(--color-primary);
        }
        
        .user-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          overflow: hidden;
          border: 2px solid var(--color-background);
          box-shadow: var(--shadow-sm);
          display: block;
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
