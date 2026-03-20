import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await adminLogin(email, password);
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <section className="auth-shell auth-shell-admin">
            <div className="auth-stage">
                <div className="auth-panel auth-panel-form">
                    <div className="auth-brand">HRMS</div>
                    <div className="admin-pill">Admin Console Access</div>
                    <h2 className="auth-title">Admin Login</h2>
                    <p className="auth-subtitle">Sign in with enterprise admin credentials to control the full HR suite.</p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleLogin} className="auth-form-stack">
                        <div className="input-icon-row">
                            <span>@</span>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Admin email"
                                autoComplete="email"
                            />
                        </div>

                        <div className="input-icon-row">
                            <span>*</span>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In as Admin'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Employee account? <Link className="auth-link" to="/login">Use employee login</Link>
                    </div>
                </div>

                <div className="auth-panel auth-panel-visual auth-panel-visual-admin">
                    <div className="admin-visual-stack">
                        <div className="admin-visual-header"></div>
                        <div className="admin-visual-grid">
                            <div className="admin-visual-widget tall"></div>
                            <div className="admin-visual-widget"></div>
                            <div className="admin-visual-widget"></div>
                            <div className="admin-visual-widget wide"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdminLogin;
