import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

const CommunityPage = () => {
    const [activeTab, setActiveTab] = useState('threads');

    // Mock Data
    const threads = [
        { id: 1, author: "Luna & Tom", title: "Best treats for training?", replies: 23, time: "2h ago" },
        { id: 2, author: "Max & Jenny", title: "Rainy day activities", replies: 15, time: "5h ago" },
        { id: 3, author: "Cooper", title: "Looking for hiking buddies!", replies: 8, time: "1d ago" },
    ];

    const qas = [
        {
            id: 1,
            question: "How do I stop my dog from pulling on walks?",
            author: "Bella's Mom",
            upvotes: 42,
            answers: 12,
            time: "3h ago"
        },
        {
            id: 2,
            question: "Best vet in Mission District?",
            author: "Rocky",
            upvotes: 28,
            answers: 7,
            time: "1d ago"
        },
    ];

    const walks = [
        {
            id: 1,
            title: "Morning Jog @ Dolores Park",
            organizer: "Sarah & Barnaby",
            date: "Tomorrow, 8:00 AM",
            joined: 8,
            maxJoined: 15,
            going: false
        },
        {
            id: 2,
            title: "Sunset Beach Walk",
            organizer: "Luna & Tom",
            date: "Friday, 6:00 PM",
            joined: 12,
            maxJoined: 20,
            going: true
        },
        {
            id: 3,
            title: "Weekend Hike - Twin Peaks",
            organizer: "Max",
            date: "Saturday, 10:00 AM",
            joined: 5,
            maxJoined: 10,
            going: false
        },
    ];

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '20px 0 10px' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Pack</h1>
                <p className="text-muted">Join threads, ask questions, schedule walks.</p>
            </div>

            {/* Tabs */}
            <div className="flex" style={{
                background: 'var(--color-surface)',
                padding: '4px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => setActiveTab('threads')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: activeTab === 'threads' ? 'var(--color-bg)' : 'transparent',
                        color: activeTab === 'threads' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem'
                    }}
                >
                    Threads
                </button>
                <button
                    onClick={() => setActiveTab('qa')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: activeTab === 'qa' ? 'var(--color-bg)' : 'transparent',
                        color: activeTab === 'qa' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem'
                    }}
                >
                    Q&A
                </button>
                <button
                    onClick={() => setActiveTab('walks')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: activeTab === 'walks' ? 'var(--color-bg)' : 'transparent',
                        color: activeTab === 'walks' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem'
                    }}
                >
                    Walks
                </button>
            </div>

            {/* Content */}
            <div className="flex-col gap-md animate-fade-in">
                {activeTab === 'threads' && (
                    <>
                        {threads.map(thread => (
                            <Card key={thread.id} style={{ padding: '15px' }}>
                                <div className="flex justify-between items-start">
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: '5px' }}>{thread.title}</h4>
                                        <p className="text-sm text-muted">
                                            by {thread.author} • {thread.time}
                                        </p>
                                    </div>
                                    <div style={{
                                        background: 'var(--color-border)',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {thread.replies} 💬
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <Button variant="ghost" fullWidth>+ Start New Thread</Button>
                    </>
                )}

                {activeTab === 'qa' && (
                    <>
                        {qas.map(qa => (
                            <Card key={qa.id} style={{ padding: '15px' }}>
                                <div className="flex items-start gap-md">
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        <button style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer'
                                        }}>⬆️</button>
                                        <span style={{
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            color: 'var(--color-primary)'
                                        }}>{qa.upvotes}</span>
                                        <button style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer'
                                        }}>⬇️</button>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: '5px' }}>{qa.question}</h4>
                                        <p className="text-sm text-muted">
                                            asked by {qa.author} • {qa.time}
                                        </p>
                                        <div style={{
                                            marginTop: '8px',
                                            display: 'flex',
                                            gap: '15px',
                                            fontSize: '0.85rem',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            <span>💬 {qa.answers} answers</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <Button variant="ghost" fullWidth>+ Ask a Question</Button>
                    </>
                )}

                {activeTab === 'walks' && (
                    <>
                        {walks.map(walk => (
                            <Card key={walk.id} style={{ padding: '15px' }}>
                                <div className="flex justify-between items-start" style={{ marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: '5px' }}>{walk.title}</h4>
                                        <p className="text-sm text-muted">
                                            Organized by {walk.organizer}
                                        </p>
                                        <p className="text-sm" style={{
                                            marginTop: '5px',
                                            color: 'var(--color-primary)',
                                            fontWeight: '500'
                                        }}>
                                            📅 {walk.date}
                                        </p>
                                    </div>
                                    <Button
                                        variant={walk.going ? "secondary" : "primary"}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.85rem',
                                            minWidth: '80px'
                                        }}
                                    >
                                        {walk.going ? "Going ✓" : "Join"}
                                    </Button>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    paddingTop: '10px',
                                    borderTop: '1px solid var(--color-border)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        marginLeft: '-8px'
                                    }}>
                                        {[...Array(Math.min(walk.joined, 3))].map((_, i) => (
                                            <div key={i} style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: `hsl(${i * 60}, 70%, 60%)`,
                                                border: '2px solid var(--color-surface)',
                                                marginLeft: '-8px'
                                            }} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted">
                                        {walk.joined}/{walk.maxJoined} joined
                                    </span>
                                </div>
                            </Card>
                        ))}
                        <Button variant="ghost" fullWidth>+ Schedule a Pack Walk</Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
