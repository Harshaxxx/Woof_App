import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './components/Feed';
import Profile from './pages/Profile';
import MapPage from './pages/MapPage';
import Marketplace from './pages/Marketplace';
import PacksList from './pages/PacksList';
import PackDetail from './pages/PackDetail';
import NotificationsPage from './pages/NotificationsPage';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-primary)'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/store" element={<Marketplace />} />
        <Route path="/packs" element={<PacksList />} />
        <Route path="/packs/:packId" element={<PackDetail />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
