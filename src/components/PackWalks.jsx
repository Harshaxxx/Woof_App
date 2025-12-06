import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Card from './Card';
import Button from './Button';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Plus, X, UserCheck } from 'lucide-react';

const PackWalks = forwardRef(({ packId, isMember }, ref) => {
    const { user } = useAuth();
    const [walks, setWalks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newWalk, setNewWalk] = useState({ title: '', location: '', date: '', time: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [rsvps, setRsvps] = useState({}); // Map of walkId -> boolean (isGoing)

    useEffect(() => {
        fetchWalks();
    }, [packId]);

    const fetchWalks = async () => {
        try {
            setLoading(true);

            // 1. Fetch Walks
            const { data: walksData, error: walksError } = await supabase
                .from('pack_walks')
                .select(`
                    *,
                    profiles:created_by (display_name, dog_name),
                    pack_walk_rsvps (count)
                `)
                .eq('pack_id', packId)
                .eq('status', 'upcoming')
                .order('start_time', { ascending: true });

            if (walksError) throw walksError;
            setWalks(walksData || []);

            // 2. Fetch User RSVPs
            if (user) {
                const { data: rsvpData, error: rsvpError } = await supabase
                    .from('pack_walk_rsvps')
                    .select('walk_id')
                    .eq('user_id', user.id);

                if (!rsvpError && rsvpData) {
                    const rsvpMap = {};
                    rsvpData.forEach(r => rsvpMap[r.walk_id] = true);
                    setRsvps(rsvpMap);
                }
            }

        } catch (error) {
            console.error('Error fetching walks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleWalk = async () => {
        if (!newWalk.title || !newWalk.date || !newWalk.time) return;

        try {
            setSubmitting(true);
            const startTime = new Date(`${newWalk.date}T${newWalk.time}`).toISOString();

            const { data, error } = await supabase
                .from('pack_walks')
                .insert({
                    pack_id: packId,
                    created_by: user.id,
                    title: newWalk.title,
                    location_name: newWalk.location,
                    start_time: startTime,
                    description: newWalk.description
                })
                .select(`
                    *,
                    profiles:created_by (display_name, dog_name),
                    pack_walk_rsvps (count)
                `)
                .single();

            if (error) throw error;

            setWalks([...walks, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
            setShowScheduleModal(false);
            setNewWalk({ title: '', location: '', date: '', time: '', description: '' });

        } catch (error) {
            console.error('Error scheduling walk:', error);
            alert('Failed to schedule walk.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRSVP = async (walkId) => {
        try {
            const { error } = await supabase
                .from('pack_walk_rsvps')
                .insert({
                    walk_id: walkId,
                    user_id: user.id
                });

            if (error) throw error;

            setRsvps(prev => ({ ...prev, [walkId]: true }));
            // Optimistic update count
            setWalks(prev => prev.map(w => {
                if (w.id === walkId) {
                    const currentCount = w.pack_walk_rsvps?.[0]?.count || 0;
                    return { ...w, pack_walk_rsvps: [{ count: currentCount + 1 }] };
                }
                return w;
            }));

        } catch (error) {
            console.error('Error RSVPing:', error);
            alert('Failed to RSVP.');
        }
    };

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        };
    };

    // Expose openModal method to parent via ref
    useImperativeHandle(ref, () => ({
        openModal: () => setShowScheduleModal(true)
    }));

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
                <h3>Upcoming Walks</h3>
                {isMember && (
                    <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                        <Plus size={16} /> Schedule
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center text-muted">Loading walks...</div>
            ) : walks.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '40px 0' }}>
                    <p>No upcoming walks. Schedule one! 🌳</p>
                </div>
            ) : (
                <div className="flex-col gap-md">
                    {walks.map(walk => {
                        const { date, time } = formatDateTime(walk.start_time);
                        const isGoing = rsvps[walk.id];
                        const attendeeCount = walk.pack_walk_rsvps?.[0]?.count || 0;

                        return (
                            <Card key={walk.id}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{walk.title}</h4>
                                        <div className="flex items-center gap-sm text-sm" style={{ marginBottom: '5px', color: 'var(--color-primary)' }}>
                                            <Calendar size={14} />
                                            <span>{date} • {time}</span>
                                        </div>
                                        <div className="flex items-center gap-sm text-sm text-muted" style={{ marginBottom: '10px' }}>
                                            <MapPin size={14} />
                                            <span>{walk.location_name || 'TBD'}</span>
                                        </div>
                                    </div>
                                    <div className="text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '6px' }}>
                                        <div className="font-bold">{attendeeCount}</div>
                                        <div className="text-xs text-muted">Going</div>
                                    </div>
                                </div>

                                <p className="text-sm text-muted" style={{ marginBottom: '15px' }}>{walk.description}</p>

                                {isMember ? (
                                    isGoing ? (
                                        <Button fullWidth variant="secondary" disabled style={{ opacity: 0.7 }}>
                                            <UserCheck size={16} style={{ marginRight: '5px' }} /> Going
                                        </Button>
                                    ) : (
                                        <Button fullWidth onClick={() => handleRSVP(walk.id)}>
                                            Join Walk
                                        </Button>
                                    )
                                ) : (
                                    <p className="text-center text-sm text-muted">Join pack to RSVP</p>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <Card className="animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
                            <h3>Schedule a Walk</h3>
                            <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <input
                            type="text"
                            placeholder="Walk Title (e.g., Morning Sniffari)"
                            value={newWalk.title}
                            onChange={(e) => setNewWalk({ ...newWalk, title: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                        />
                        <div className="flex gap-md" style={{ marginBottom: '10px' }}>
                            <input
                                type="date"
                                value={newWalk.date}
                                onChange={(e) => setNewWalk({ ...newWalk, date: e.target.value })}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                            />
                            <input
                                type="time"
                                value={newWalk.time}
                                onChange={(e) => setNewWalk({ ...newWalk, time: e.target.value })}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Location Name"
                            value={newWalk.location}
                            onChange={(e) => setNewWalk({ ...newWalk, location: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newWalk.description}
                            onChange={(e) => setNewWalk({ ...newWalk, description: e.target.value })}
                            style={{ width: '100%', height: '80px', padding: '10px', marginBottom: '20px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', resize: 'none' }}
                        />

                        <Button fullWidth onClick={handleScheduleWalk} disabled={submitting}>
                            {submitting ? 'Scheduling...' : 'Create Walk'}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
});

export default PackWalks;
