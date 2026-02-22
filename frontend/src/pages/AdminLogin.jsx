import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await adminLogin(username, password);
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-card glass-panel">
            <div className="admin-pill">Admin Console Access</div>
            <h2 className="auth-title">Admin Login</h2>
            <p className="auth-subtitle">Sign in with enterprise admin credentials</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label className="form-label">Admin Username</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter admin username"
                        autoComplete="username"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In as Admin'}
                </button>
            </form>

            <div className="auth-footer">
                Employee account? <Link className="auth-link" to="/login">Use Employee Login</Link>
            </div>
        </div>
    );
};

export default AdminLogin;
