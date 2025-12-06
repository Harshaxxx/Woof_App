import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import MissionCard from '../components/MissionCard';
import Badge from '../components/Badge';

const PlayPage = () => {
    const [bones, setBones] = useState(1250);

    const [missions, setMissions] = useState([
        { id: 1, title: "Morning Sniffari", reward: 50, progress: 1, total: 1, icon: "🌅", claimed: false },
        { id: 2, title: "Pack Walk", reward: 100, progress: 2, total: 3, icon: "🐕", claimed: false },
        { id: 3, title: "Distance Challenge", reward: 200, progress: 1.5, total: 3.0, icon: "📏", claimed: false },
    ]);

    const badges = [
        { id: 1, name: "Early Bird", icon: "🐦", unlocked: true },
        { id: 2, name: "Marathon", icon: "🏃", unlocked: false },
        { id: 3, name: "Socialite", icon: "🤝", unlocked: true },
        { id: 4, name: "Explorer", icon: "🧭", unlocked: false },
    ];

    const leaderboard = [
        { id: 1, name: "Luna", bones: 2400, img: "🐕" },
        { id: 2, name: "Barnaby (You)", bones: 1250, img: "🐩" },
        { id: 3, name: "Cooper", bones: 980, img: "🐕‍🦺" },
    ];

    const handleClaim = (id) => {
        setMissions(missions.map(m => {
            if (m.id === id) {
                setBones(prev => prev + m.reward);
                return { ...m, claimed: true };
            }
            return m;
        }));
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            {/* Header / Balance */}
            <div className="text-center" style={{ padding: '20px 0' }}>
                <p className="text-muted">Current Balance</p>
                <h1 style={{
                    fontSize: '3.5rem',
                    color: 'var(--color-accent)',
                    textShadow: '0 0 20px rgba(255, 217, 61, 0.3)'
                }}>
                    {bones} <span style={{ fontSize: '2rem' }}>🦴</span>
                </h1>
                <Button variant="secondary" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                    Redeem Perks 🛍️
                </Button>
            </div>

            {/* Daily Streak */}
            <Card className="text-center" style={{ marginBottom: '20px' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
                    <h3>Daily Streak</h3>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>🔥 7 Days</span>
                </div>
                <div className="flex justify-between">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: i < 6 ? 'var(--color-primary)' : 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: i < 6 ? '#fff' : 'var(--color-text-muted)'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Missions */}
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ marginBottom: '15px' }}>Daily Missions</h3>
                <div className="flex-col gap-md">
                    {missions.filter(m => !m.claimed).map(mission => (
                        <MissionCard
                            key={mission.id}
                            {...mission}
                            onClaim={() => handleClaim(mission.id)}
                        />
                    ))}
                    {missions.every(m => m.claimed) && (
                        <div className="text-center text-muted" style={{ padding: '20px' }}>
                            All missions completed! 🎉
                        </div>
                    )}
                </div>
            </div>

            {/* Badges */}
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ marginBottom: '15px' }}>Badges</h3>
                <div className="flex" style={{ gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {badges.map(badge => (
                        <Badge key={badge.id} {...badge} />
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div>
                <h3 style={{ marginBottom: '15px' }}>Pack Leaderboard</h3>
                <Card className="flex-col gap-sm" padding="sm">
                    {leaderboard.map((dog, i) => (
                        <div key={dog.id} className="flex items-center justify-between" style={{
                            padding: '10px',
                            background: dog.name.includes('You') ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                            borderRadius: '8px'
                        }}>
                            <div className="flex items-center gap-md">
                                <span style={{ fontWeight: 'bold', width: '20px' }}>#{i + 1}</span>
                                <span style={{ fontSize: '1.5rem' }}>{dog.img}</span>
                                <span style={{ fontWeight: dog.name.includes('You') ? 'bold' : 'normal' }}>{dog.name}</span>
                            </div>
                            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{dog.bones} 🦴</span>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default PlayPage;
