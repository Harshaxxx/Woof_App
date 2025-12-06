import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useWalkSession } from '../hooks/useWalkSession';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WalkTracker = ({ userPosition }) => {
    const { isWalking, elapsedSeconds, distanceMeters, startWalk, endWalk } = useWalkSession(userPosition);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showSummary, setShowSummary] = useState(false);
    const [lastWalkSummary, setLastWalkSummary] = useState(null);
    const [bonesEarned, setBonesEarned] = useState(0);

    // Convert meters to miles for display
    const distanceMiles = (distanceMeters * 0.000621371).toFixed(2);
    const steps = Math.round(distanceMeters * 1.31); // Approx steps/meter

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        startWalk();
        setShowSummary(false);
    };

    const handleShare = async () => {
        if (!user || !supabase) return;

        try {
            const miles = (lastWalkSummary.distance_meters * 0.000621371).toFixed(2);
            const { error } = await supabase
                .from('feed_posts')
                .insert({
                    user_id: user.id,
                    text: `Just walked ${miles} miles and earned ${bonesEarned} bones! 🦴`,
                    type: 'walk_summary'
                });

            if (error) throw error;

            setShowSummary(false);
            navigate('/'); // Go to Feed
            window.scrollTo(0, 0); // Scroll to top

        } catch (error) {
            console.error('Error sharing to feed:', error);
        }
    };

    const handleEnd = async () => {
        const summary = endWalk();
        setLastWalkSummary(summary);

        // Calculate bones: 0 if minimal walk (< 100m), otherwise 5 base + 20 per km
        let calculatedBones = 0;
        if (summary.distance_meters > 100) {
            calculatedBones = Math.max(5, Math.round((summary.distance_meters / 1000) * 20));
        }
        setBonesEarned(calculatedBones);
        setShowSummary(true);

        if (user && supabase) {
            try {
                // 1. Insert into walks
                const { data: walk, error: walkError } = await supabase
                    .from('walks')
                    .insert({
                        user_id: user.id,
                        started_at: summary.started_at,
                        ended_at: summary.ended_at,
                        distance_meters: summary.distance_meters,
                        duration_seconds: summary.duration_seconds,
                        bones_earned: calculatedBones,
                        path: summary.path
                    })
                    .select()
                    .single();

                if (walkError) throw walkError;

                // 2. Insert into bone_transactions
                const { error: txError } = await supabase
                    .from('bone_transactions')
                    .insert({
                        user_id: user.id,
                        amount: calculatedBones,
                        type: 'walk_earn',
                        meta: { walk_id: walk.id }
                    });

                if (txError) throw txError;

                // 3. Update bone_wallets
                // First check if wallet exists
                const { data: wallet } = await supabase
                    .from('bone_wallets')
                    .select('balance')
                    .eq('user_id', user.id)
                    .single();

                if (wallet) {
                    await supabase
                        .from('bone_wallets')
                        .update({ balance: wallet.balance + calculatedBones })
                        .eq('user_id', user.id);
                } else {
                    await supabase
                        .from('bone_wallets')
                        .insert({ user_id: user.id, balance: calculatedBones });
                }

                console.log('Walk saved successfully!');

            } catch (error) {
                console.error('Error saving walk:', error);
            }
        }
    };

    if (showSummary) {
        return (
            <div style={{
                position: 'absolute',
                bottom: '80px',
                left: '20px',
                right: '20px',
                zIndex: 1000
            }}>
                <Card className="animate-fade-in" style={{
                    width: '100%',
                    maxWidth: '400px',
                    textAlign: 'center',
                    background: '#111111',
                    border: '1px solid #333',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    <div className="text-center">
                        <h2 style={{ color: 'var(--color-primary)' }}>Walk Complete! 🎉</h2>
                        <p className="text-muted" style={{ marginBottom: '15px' }}>Great job out there.</p>

                        <div className="flex justify-between" style={{ marginBottom: '20px' }}>
                            <div>
                                <h3>{(lastWalkSummary?.distance_meters * 0.000621371).toFixed(2)}</h3>
                                <p className="text-sm text-muted">Miles</p>
                            </div>
                            <div>
                                <h3>{formatTime(lastWalkSummary?.duration_seconds || 0)}</h3>
                                <p className="text-sm text-muted">Time</p>
                            </div>
                            <div>
                                <h3>{Math.round((lastWalkSummary?.distance_meters || 0) * 1.31)}</h3>
                                <p className="text-sm text-muted">Steps</p>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 184, 0, 0.1)',
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid var(--color-primary)'
                        }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '5px' }}>+{bonesEarned}</p>
                            <p className="text-sm text-muted">Bones Earned 🦴</p>
                        </div>

                        <div className="flex-col gap-sm">
                            <Button fullWidth onClick={handleShare}>Share to Feed 📢</Button>
                            <Button fullWidth variant="ghost" onClick={() => setShowSummary(false)}>Done</Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (!isWalking) {
        return (
            <div style={{
                position: 'absolute',
                bottom: '120px',
                left: '0',
                right: '0',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none'
            }}>
                <div style={{ pointerEvents: 'auto' }}>
                    <Button
                        onClick={handleStart}
                        style={{
                            padding: '14px 28px',
                            fontSize: '1rem',
                            borderRadius: '50px',
                            boxShadow: '0 8px 32px rgba(255, 184, 0, 0.3)',
                            background: 'var(--color-primary)',
                            color: 'black',
                            fontWeight: 'bold',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>Start Walk</span>
                        <span style={{ fontSize: '1.4rem' }}>🐕</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            bottom: '120px',
            left: '20px',
            right: '20px',
            zIndex: 1000
        }}>
            <div style={{
                background: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                        <p className="text-xs text-muted" style={{ marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Time</p>
                        <h3 style={{ fontFamily: 'monospace', fontSize: '1.5rem', margin: 0 }}>{formatTime(elapsedSeconds)}</h3>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <div>
                        <p className="text-xs text-muted" style={{ marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Distance</p>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{distanceMiles}<span style={{ fontSize: '0.9rem', color: '#888', marginLeft: '4px' }}>mi</span></h3>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    onClick={handleEnd}
                    style={{
                        borderColor: 'rgba(255, 69, 58, 0.3)',
                        color: '#ff453a',
                        background: 'rgba(255, 69, 58, 0.1)',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontWeight: 600
                    }}
                >
                    End Walk
                </Button>
            </div>
        </div>
    );
};

export default WalkTracker;
