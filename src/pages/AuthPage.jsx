import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                alert('Check your email for the login link!');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center" style={{ minHeight: '100vh' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center" style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>woof</h1>
                    <p className="text-muted">Walk, connect, play, earn.</p>
                </div>

                <Card>
                    <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                        {isLogin ? 'Welcome Back' : 'Join the Vibe'}
                    </h2>

                    {error && (
                        <div style={{
                            background: 'rgba(231, 76, 60, 0.2)',
                            color: 'var(--color-danger)',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex-col gap-md">
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <Button fullWidth disabled={loading}>
                            {loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
                        </Button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p className="text-sm text-muted">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span
                                onClick={() => setIsLogin(!isLogin)}
                                style={{
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </span>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
