import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MapPin, Users } from 'lucide-react';

const PacksList = () => {
    const navigate = useNavigate();
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPacks();
    }, []);

    const fetchPacks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('packs')
                .select('*')
                .order('member_count', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setPacks(data);
            } else {
                // Attempt to seed if empty (Dev helper)
                seedPacks();
            }
        } catch (error) {
            console.error('Error fetching packs:', error);
            // Fallback mock data if table doesn't exist yet
            setPacks([
                { id: '1', name: 'Liberty State Park Pack', city: 'Jersey City', member_count: 56, description: 'Morning runs by the Statue of Liberty! 🗽' },
                { id: '2', name: 'Hoboken Waterfront Pups', city: 'Hoboken', member_count: 89, description: 'Pier A & Sinatra Park meetups.' },
                { id: '3', name: 'Central Park Explorers', city: 'New York City', member_count: 124, description: 'The biggest pack in the Big Apple.' },
                { id: '4', name: 'Hamilton Park Hounds', city: 'Jersey City', member_count: 34, description: 'Small dogs, big personalities.' },
                { id: '5', name: 'Washington Square Woofs', city: 'New York City', member_count: 78, description: 'Music, squirrels, and vibes.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const seedPacks = async () => {
        const mockPacks = [
            { name: 'Liberty State Park Pack', city: 'Jersey City', member_count: 56, description: 'Morning runs by the Statue of Liberty! 🗽' },
            { name: 'Hoboken Waterfront Pups', city: 'Hoboken', member_count: 89, description: 'Pier A & Sinatra Park meetups.' },
            { name: 'Central Park Explorers', city: 'New York City', member_count: 124, description: 'The biggest pack in the Big Apple.' },
            { name: 'Hamilton Park Hounds', city: 'Jersey City', member_count: 34, description: 'Small dogs, big personalities.' },
            { name: 'Washington Square Woofs', city: 'New York City', member_count: 78, description: 'Music, squirrels, and vibes.' },
        ];

        try {
            const { data, error } = await supabase.from('packs').insert(mockPacks).select();
            if (data) setPacks(data);
        } catch (err) {
            console.log('Seeding failed (tables might not exist yet):', err);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ padding: '20px 0 10px' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Packs Near You</h1>
                <p className="text-muted">Join local groups for walks, tips, and buddies.</p>
            </div>

            <div className="flex-col gap-md">
                {loading ? (
                    <div className="text-center text-muted">Loading packs...</div>
                ) : packs.length === 0 ? (
                    <div className="text-center text-muted">No packs found nearby. Create one?</div>
                ) : (
                    packs.map(pack => (
                        <Card
                            key={pack.id}
                            onClick={() => navigate(`/packs/${pack.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 style={{ marginBottom: '5px' }}>{pack.name}</h3>
                                    <div className="flex items-center gap-sm text-muted text-sm" style={{ marginBottom: '10px' }}>
                                        <MapPin size={14} />
                                        <span>{pack.city || 'Unknown Location'}</span>
                                    </div>
                                    <p className="text-sm">{pack.description}</p>
                                </div>
                                <div className="text-center" style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '8px 12px',
                                    borderRadius: '8px'
                                }}>
                                    <Users size={20} style={{ color: 'var(--color-primary)', marginBottom: '4px' }} />
                                    <div className="font-bold">{pack.member_count}</div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '15px',
                                paddingTop: '10px',
                                borderTop: '1px solid var(--color-border)',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                🐾 Next walk: Check details
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default PacksList;
