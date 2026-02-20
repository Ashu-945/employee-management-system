import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
            <h1 style={{
                fontSize: '4rem',
                fontWeight: '800',
                marginBottom: '1.5rem',
                background: 'linear-gradient(to right, #4F46E5, #10B981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.2'
            }}>
                Secure Fullstack Authentication
            </h1>
            <p style={{
                fontSize: '1.25rem',
                color: 'var(--text-muted)',
                marginBottom: '3rem',
                lineHeight: '1.6'
            }}>
                A production-ready implementation of role-based JWT authentication using React, Vite, Spring Boot, and PostgreSQL.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                <Link to="/signup" className="btn btn-primary" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.125rem' }}>
                    Get Started
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.125rem' }}>
                    Sign In
                </Link>
            </div>

        </div>
    );
};

export default Home;
