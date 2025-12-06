import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

const NotificationsPage = () => {
    const navigate = useNavigate();
    // Mock notifications state - set to empty array to test "Nothing to show here"
    const [notifications, setNotifications] = useState([]);

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '20px' }}>
            {/* Header */}
            <div className="flex items-center gap-md" style={{ marginBottom: '20px' }}>
                <Button variant="ghost" onClick={() => navigate(-1)} style={{ padding: '8px' }}>
                    <ArrowLeft size={24} />
                </Button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Notifications</h1>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {notifications.length === 0 ? (
                    <div className="flex-col items-center justify-center" style={{
                        height: '60vh',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)'
                    }}>
                        <div style={{
                            background: 'var(--color-surface)',
                            padding: '30px',
                            borderRadius: '50%',
                            marginBottom: '20px'
                        }}>
                            <Bell size={48} style={{ opacity: 0.5 }} />
                        </div>
                        <h3>Nothing to show here</h3>
                        <p>You're all caught up! 🐾</p>
                    </div>
                ) : (
                    <div className="flex-col gap-md">
                        {notifications.map(notification => (
                            <Card key={notification.id}>
                                <p>{notification.message}</p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
