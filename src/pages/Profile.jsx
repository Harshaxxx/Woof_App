import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [dogName, setDogName] = useState('');
  const [location, setLocation] = useState('');
  const [bones, setBones] = useState(0);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);

      // 1. Get Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || '');
        setDogName(profileData.dog_name || '');
        setLocation(profileData.location || '');
      } else {
        setEditing(true);
      }

      // 2. Get Bones
      const { data: walletData, error: walletError } = await supabase
        .from('bone_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!walletError && walletData) {
        setBones(walletData.balance);
      }

    } catch (error) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updates = {
        id: user.id,
        display_name: displayName,
        dog_name: dogName,
        location: location,
        // updated_at: new Date(), // Add this column if you want to track updates
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      setProfile(updates);
      setEditing(false);
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile && !editing) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  return (
    <div className="container">
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        {/* Profile Header */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          margin: '0 auto 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#fff',
          boxShadow: 'var(--shadow-glow)'
        }}>
          {dogName ? dogName[0].toUpperCase() : '?'}
        </div>

        {editing ? (
          <form onSubmit={updateProfile} className="flex-col gap-md" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '10px', borderRadius: '8px' }}
            />
            <input
              type="text"
              placeholder="Dog's Name"
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '10px', borderRadius: '8px' }}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '10px', borderRadius: '8px' }}
            />
            <div className="flex gap-2 justify-center">
              <Button type="submit" disabled={loading}>Save Profile</Button>
              {profile && (
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              )}
            </div>
          </form>
        ) : (
          <>
            <h2>{dogName || 'Unnamed Dog'}</h2>
            <p className="text-muted">{displayName || 'Anonymous'} • {location || 'Unknown Location'}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
              <span style={{
                background: 'rgba(46, 204, 113, 0.2)',
                color: 'var(--color-success)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ✓ Duo Verified
              </span>
            </div>
          </>
        )}
      </div>

      {/* Stats Row */}
      {!editing && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' }}>
          <Card className="text-center" style={{ flex: 1, padding: '10px 5px' }}>
            <h3 style={{ color: 'var(--color-primary)' }}>0</h3>
            <p className="text-sm text-muted">Walks</p>
          </Card>
          <Card className="text-center" style={{ flex: 1, padding: '10px 5px' }}>
            <h3 style={{ color: 'var(--color-primary)' }}>0</h3>
            <p className="text-sm text-muted">Buddies</p>
          </Card>
          <Card className="text-center" style={{ flex: 1, padding: '10px 5px' }}>
            <h3 style={{ color: 'var(--color-accent)' }}>0 🔥</h3>
            <p className="text-sm text-muted">Streak</p>
          </Card>
          <Card className="text-center" style={{ flex: 1, padding: '10px 5px', background: 'rgba(255, 184, 0, 0.1)', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ color: 'var(--color-primary)' }}>{bones} 🦴</h3>
            <p className="text-sm text-muted">Bones</p>
          </Card>
        </div>
      )}

      {/* Quick Links */}
      {!editing && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Quick Links</h3>
          <div className="flex gap-md">
            <Card
              className="text-center"
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => window.location.href = '/care'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🩺</div>
              <p className="font-bold">Care Hub</p>
            </Card>
            <Card
              className="text-center"
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => window.location.href = '/store'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛍️</div>
              <p className="font-bold">Shop</p>
            </Card>
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button fullWidth onClick={() => setEditing(true)}>Edit Profile</Button>
          <Button fullWidth variant="secondary" onClick={signOut} style={{ background: 'rgba(231, 76, 60, 0.2)', color: 'var(--color-danger)', border: 'none' }}>Sign Out</Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
