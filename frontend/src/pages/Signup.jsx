import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const isAdmin = user.roles?.includes('ROLE_ADMIN');
        navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }, [navigate, user]);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const result = await register(name, email, password);

        if (result.success) {
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <section className="auth-shell">
            <div className="auth-stage">
                <div className="auth-panel auth-panel-form">
                    <div className="auth-brand">HRMS</div>
                    <div className="admin-pill">New Employee Access</div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join the platform with a secure employee account and sign in to your workspace.</p>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSignup} className="auth-form-stack">
                        <div className="input-icon-row">
                            <span>U</span>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full name"
                                autoComplete="name"
                            />
                        </div>

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
                                placeholder="Create password"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="input-icon-row">
                            <span>*</span>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={loading || !!success}
                        >
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
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

export default Signup;
