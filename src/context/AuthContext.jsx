import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for changes
        let authListener = null;
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });
            authListener = subscription;
        }

        return () => {
            if (authListener) authListener.unsubscribe();
        };
    }, []);

    const value = {
        signUp: (data) => supabase?.auth.signUp(data) ?? Promise.resolve({ error: { message: 'Supabase not initialized. Check your .env file.' } }),
        signIn: (data) => supabase?.auth.signInWithPassword(data) ?? Promise.resolve({ error: { message: 'Supabase not initialized. Check your .env file.' } }),
        signOut: () => supabase?.auth.signOut() ?? Promise.resolve({ error: { message: 'Supabase not initialized' } }),
        user,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    background: 'var(--color-bg)',
                    color: 'var(--color-primary)'
                }}>
                    Loading...
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
