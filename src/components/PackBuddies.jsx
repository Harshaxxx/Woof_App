import React, { useEffect, useState } from 'react';
import Card from './Card';
import { supabase } from '../supabaseClient';
import { User } from 'lucide-react';

const PackBuddies = ({ packId }) => {
    const [buddies, setBuddies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBuddies();
    }, [packId]);

    const fetchBuddies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pack_members')
                .select(`
                    joined_at,
                    role,
                    profiles:user_id (
                        id,
                        display_name,
                        dog_name,
                        avatar_url,
                        location
                    )
                `)
                .eq('pack_id', packId)
                .order('joined_at', { ascending: false });

            if (error) throw error;
            setBuddies(data || []);

        } catch (error) {
            console.error('Error fetching buddies:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
                <h3>Pack Members</h3>
                <span className="text-sm text-muted">{buddies.length} buddies</span>
            </div>

            {loading ? (
                <div className="text-center text-muted">Loading buddies...</div>
            ) : buddies.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '40px 0' }}>
                    <p>No buddies yet. Invite some friends! 🐕</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px'
                }}>
                    {buddies.map(buddy => (
                        <Card key={buddy.profiles.id} style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--color-surface)',
                                margin: '0 auto 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid var(--color-primary)',
                                overflow: 'hidden'
                            }}>
                                {buddy.profiles.avatar_url ? (
                                    <img src={buddy.profiles.avatar_url} alt={buddy.profiles.dog_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        {buddy.profiles.dog_name?.[0] || '?'}
                                    </span>
                                )}
                            </div>

                            <h4 style={{ marginBottom: '2px' }}>{buddy.profiles.dog_name || 'Unknown'}</h4>
                            <p className="text-xs text-muted" style={{ marginBottom: '8px' }}>{buddy.profiles.display_name}</p>

                            {buddy.role === 'admin' && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(255, 184, 0, 0.2)',
                                    color: 'var(--color-primary)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    Admin
                                </span>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PackBuddies;
