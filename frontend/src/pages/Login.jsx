import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const isAdmin = user.roles?.includes('ROLE_ADMIN');
        navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }, [navigate, user]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const isAdmin = storedUser?.roles?.includes('ROLE_ADMIN');
            navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <section className="auth-shell">
            <div className="auth-stage">
                <div className="auth-panel auth-panel-form">
                    <div className="auth-brand">HRMS</div>
                    <div className="auth-avatar">EM</div>
                    <div className="auth-tabline">
                        <span className="auth-tabline-label">Login as:</span>
                        <strong>User</strong>
                        <Link to="/admin/login" className="auth-link">Admin</Link>
                    </div>
                    <h2 className="auth-title">Sign In</h2>
                    <p className="auth-subtitle">Access your workforce dashboard with enterprise-grade security.</p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleLogin} className="auth-form-stack">
                        <div className="input-icon-row">
                            <span>@</span>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
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
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                        <span>New here? <Link to="/signup" className="auth-link">Create account</Link></span>
                    </div>
                </div>

                <div className="auth-panel auth-panel-visual">
                    <div className="auth-illustration">
                        <div className="auth-illustration-window">
                            <div className="auth-illustration-bar"></div>
                            <div className="auth-illustration-card auth-card-a"></div>
                            <div className="auth-illustration-card auth-card-b"></div>
                            <div className="auth-illustration-person auth-person-main"></div>
                            <div className="auth-illustration-person auth-person-side"></div>
                        </div>
                        <div className="auth-gear auth-gear-lg"></div>
                        <div className="auth-gear auth-gear-sm"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
