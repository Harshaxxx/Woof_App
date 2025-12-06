import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const CareHub = () => {
    const reminders = [
        { id: 1, title: "Rabies Vaccine Due", date: "Dec 15, 2025", type: "vaccine" },
        { id: 2, title: "Heartworm Medication", date: "Nov 25, 2025", type: "medication" },
        { id: 3, title: "Annual Checkup", date: "Jan 10, 2026", type: "checkup" },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'vaccine': return '💉';
            case 'medication': return '💊';
            case 'checkup': return '🩺';
            default: return '📋';
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ padding: '20px 0 10px' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Care Hub</h1>
                <p className="text-muted">Keep Barnaby healthy and happy.</p>
            </div>

            {/* Upcoming Reminders */}
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ marginBottom: '15px' }}>Upcoming Reminders</h3>
                <div className="flex-col gap-md">
                    {reminders.map(reminder => (
                        <Card key={reminder.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-md">
                                <div style={{ fontSize: '2rem' }}>{getIcon(reminder.type)}</div>
                                <div>
                                    <h4>{reminder.title}</h4>
                                    <p className="text-sm text-muted">{reminder.date}</p>
                                </div>
                            </div>
                            <Button variant="ghost" style={{ padding: '8px' }}>✓</Button>
                        </Card>
                    ))}
                </div>
                <Button variant="ghost" fullWidth style={{ marginTop: '10px' }}>
                    + Add Reminder
                </Button>
            </div>

            {/* Insurance */}
            <div style={{ marginBottom: '25px' }}>
                <h3 style={{ marginBottom: '15px' }}>Insurance</h3>
                <Card>
                    <div className="flex items-center gap-md" style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '2.5rem' }}>🛡️</div>
                        <div>
                            <h4>Pet Insurance</h4>
                            <p className="text-sm text-muted">Protect Barnaby with coverage</p>
                        </div>
                    </div>
                    <Button fullWidth variant="secondary">View Plans</Button>
                </Card>
            </div>

            {/* Health Records */}
            <div>
                <h3 style={{ marginBottom: '15px' }}>Recent Visits</h3>
                <Card className="flex-col gap-sm">
                    <div className="flex justify-between items-center" style={{ padding: '8px 0' }}>
                        <div>
                            <p className="font-bold">Dr. Smith - Annual Checkup</p>
                            <p className="text-sm text-muted">Oct 15, 2025</p>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-success)' }}>✓ Healthy</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CareHub;
