import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <section className="home-shell">
            <div className="home-hero glass-panel">
                <p className="home-kicker">Enterprise Workforce Platform</p>
                <h1>Manage your workforce with secure, role-based operations</h1>
                <p className="home-copy">
                    Centralize employee records, department workflows, onboarding tasks, and approvals in one
                    production-ready management console.
                </p>
                <div className="home-actions">
                    <Link to="/signup" className="btn btn-primary" style={{ width: 'auto' }}>Get Started</Link>
                    <Link to="/login" className="btn btn-outline" style={{ width: 'auto' }}>Employee Login</Link>
                    <Link to="/admin/login" className="btn btn-outline" style={{ width: 'auto' }}>Admin Login</Link>
                </div>
            </div>

            <div className="home-grid">
                <article className="feature-card glass-panel">
                    <h3>Employee Data Hub</h3>
                    <p>Unified profile records with structured search, filters, and controlled updates.</p>
                </article>
                <article className="feature-card glass-panel">
                    <h3>Access Governance</h3>
                    <p>Role-based authorization with scoped actions for Admin, HR, and employees.</p>
                </article>
                <article className="feature-card glass-panel">
                    <h3>Operational Readiness</h3>
                    <p>Designed for growth with clean APIs, paginated lists, and modular service boundaries.</p>
                </article>
            </div>
        </section>
    );
};

export default Home;
