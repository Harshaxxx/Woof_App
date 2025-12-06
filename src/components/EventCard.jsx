import React from 'react';
import Card from './Card';
import Button from './Button';

const EventCard = ({ title, date, time, location, attendees, going = false, onRSVP }) => {
    return (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
            {/* Event Image Placeholder */}
            <div style={{
                height: '120px',
                background: 'linear-gradient(45deg, var(--color-secondary), var(--color-surface))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.2)',
                fontSize: '3rem'
            }}>
                📅
            </div>

            <div style={{ padding: '15px' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '10px' }}>
                    <div>
                        <p style={{
                            color: 'var(--color-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {date} • {time}
                        </p>
                        <h3 style={{ margin: '5px 0' }}>{title}</h3>
                        <p className="text-sm text-muted">📍 {location}</p>
                    </div>

                    <div style={{
                        background: 'var(--color-bg)',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <span style={{ display: 'block', fontWeight: 'bold' }}>{attendees}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Going</span>
                    </div>
                </div>

                <Button
                    fullWidth
                    variant={going ? "secondary" : "primary"}
                    onClick={onRSVP}
                >
                    {going ? "✓ You're Going" : "RSVP Now"}
                </Button>
            </div>
        </Card>
    );
};

export default EventCard;
