import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosConfig';

const Dashboard = () => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserContent = async () => {
            try {
                const response = await axios.get('/test/user');
                setContent(response.data);
            } catch (err) {
                setError(
                    err.response && err.response.data && err.response.data.message
                        ? err.response.data.message
                        : "Error fetching protected content. Your token may have expired."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUserContent();
    }, []);

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Secure Connection Active</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Profile Card */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)'
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{user?.username}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{user?.email}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                        {user?.roles?.map((role, index) => (
                            <span key={index} style={{
                                background: 'rgba(79, 70, 229, 0.2)',
                                color: '#818cf8',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                border: '1px solid rgba(79, 70, 229, 0.3)'
                            }}>
                                {role.replace('ROLE_', '')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>#</span> Secure Data Fetch
                        </h3>

                        {loading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Communicating securely with Spring Boot backend...</p>
                        ) : error ? (
                            <div className="alert alert-error" style={{ margin: 0 }}>{error}</div>
                        ) : (
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                padding: '1.5rem',
                                borderRadius: 'var(--border-radius-md)',
                                border: '1px dashed rgba(255, 255, 255, 0.1)'
                            }}>
                                <p style={{ color: 'var(--success)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>{"// Response from GET /api/test/user"}</p>
                                <p style={{ fontSize: '1.1rem' }}>"{content}"</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>#</span> Security Context
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            You are currently viewing this page because a valid JWT (JSON Web Token) exists in your application state.
                            All outgoing requests from this dashboard are automatically intercepted by Axios and injected with the
                            <code>Authorization: Bearer &lt;token&gt;</code> header to authorize against the Spring Security filter chain.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
