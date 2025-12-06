import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import PackWalks from '../components/PackWalks';
import { useAuth } from '../context/AuthContext';
import PackQA from '../components/PackQA';
import PackBuddies from '../components/PackBuddies';
import { supabase } from '../supabaseClient';

const PackDetail = () => {
    const { packId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pack, setPack] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('qa'); // qa, walks, buddies

    // Refs to trigger child component modals
    const qaRef = useRef();
    const walksRef = useRef();

    useEffect(() => {
        if (user && packId) {
            fetchPackDetails();
        }
    }, [user, packId]);

    const fetchPackDetails = async () => {
        try {
            setLoading(true);

            // 1. Get Pack Info
            const { data: packData, error: packError } = await supabase
                .from('packs')
                .select('*')
                .eq('id', packId)
                .single();

            if (packError) throw packError;
            setPack(packData);

            // 2. Check Membership
            const { data: memberData, error: memberError } = await supabase
                .from('pack_members')
                .select('*')
                .eq('pack_id', packId)
                .eq('user_id', user.id)
                .single();

            if (!memberError && memberData) {
                setIsMember(true);
            } else {
                setIsMember(false);
            }

        } catch (error) {
            console.error('Error fetching pack details:', error);
            // Fallback for demo if DB is empty/missing
            // Fallback for demo if DB is empty/missing
            if (!pack) {
                const mockPacks = [
                    { id: '1', name: 'Liberty State Park Pack', city: 'Jersey City', member_count: 56, description: 'Morning runs by the Statue of Liberty! 🗽' },
                    { id: '2', name: 'Hoboken Waterfront Pups', city: 'Hoboken', member_count: 89, description: 'Pier A & Sinatra Park meetups.' },
                    { id: '3', name: 'Central Park Explorers', city: 'New York City', member_count: 124, description: 'The biggest pack in the Big Apple.' },
                    { id: '4', name: 'Hamilton Park Hounds', city: 'Jersey City', member_count: 34, description: 'Small dogs, big personalities.' },
                    { id: '5', name: 'Washington Square Woofs', city: 'New York City', member_count: 78, description: 'Music, squirrels, and vibes.' },
                ];
                const foundPack = mockPacks.find(p => p.id === packId) || mockPacks[0];
                setPack(foundPack);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            const { error } = await supabase
                .from('pack_members')
                .insert({
                    pack_id: packId,
                    user_id: user.id
                });

            if (error) throw error;

            setIsMember(true);
            // Optimistically update member count
            setPack(prev => ({ ...prev, member_count: (prev.member_count || 0) + 1 }));

            // Update DB count
            await supabase.rpc('increment_pack_members', { pack_id: packId }); // If RPC exists, otherwise just rely on client state for now

        } catch (error) {
            console.error('Error joining pack:', error);
            alert('Could not join pack. Please try again.');
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this pack?')) return;

        try {
            const { error } = await supabase
                .from('pack_members')
                .delete()
                .eq('pack_id', packId)
                .eq('user_id', user.id);

            if (error) throw error;

            setIsMember(false);
            setPack(prev => ({ ...prev, member_count: Math.max(0, (prev.member_count || 0) - 1) }));

        } catch (error) {
            console.error('Error leaving pack:', error);
        }
    };

    if (loading && !pack) return <div className="container text-center p-4">Loading pack...</div>;

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '20px' }}>
            {/* Header */}
            <div className="flex items-center gap-md" style={{ marginBottom: '20px' }}>
                <Button variant="ghost" onClick={() => navigate('/packs')} style={{ padding: '8px' }}>
                    <ArrowLeft size={24} />
                </Button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{pack?.name}</h1>
            </div>

            {/* Pack Info Card */}
            <Card style={{ marginBottom: '20px' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-sm text-muted" style={{ marginBottom: '10px' }}>
                            <MapPin size={16} />
                            <span>{pack?.city}</span>
                        </div>
                        <p>{pack?.description}</p>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
                            {pack?.member_count}
                        </div>
                        <div className="text-xs text-muted">Members</div>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    {isMember ? (
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={handleLeave}
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                        >
                            Joined ✓
                        </Button>
                    ) : (
                        <Button fullWidth onClick={handleJoin}>
                            Join Pack
                        </Button>
                    )}
                </div>
            </Card>

            {/* Quick Actions */}
            {isMember && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <Button
                        style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}
                        onClick={() => {
                            setActiveTab('qa');
                            setTimeout(() => qaRef.current?.openModal(), 100);
                        }}
                    >
                        💬 Ask Question
                    </Button>
                    <Button
                        style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}
                        onClick={() => {
                            setActiveTab('walks');
                            setTimeout(() => walksRef.current?.openModal(), 100);
                        }}
                    >
                        🚶 Schedule Walk
                    </Button>
                    <Button
                        style={{ flex: 1, fontSize: '0.9rem', padding: '10px' }}
                        onClick={() => setActiveTab('buddies')}
                    >
                        👥 View Buddies
                    </Button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex" style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
                {['Q&A', 'Walks', 'Buddies'].map(tab => {
                    const id = tab.toLowerCase().replace('&', '');
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(id)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'none',
                                border: 'none',
                                borderBottom: isActive ? '2px solid var(--color-primary)' : 'none',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: isActive ? 'bold' : 'normal',
                                cursor: 'pointer'
                            }}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'qa' && (
                    <PackQA ref={qaRef} packId={packId} isMember={isMember} />
                )}
                {activeTab === 'walks' && (
                    <PackWalks ref={walksRef} packId={packId} isMember={isMember} />
                )}
                {activeTab === 'buddies' && (
                    <PackBuddies packId={packId} />
                )}
            </div>
        </div>
    );
};

export default PackDetail;
