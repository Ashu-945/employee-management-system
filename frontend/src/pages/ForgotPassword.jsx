import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const requestToken = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to generate reset token');
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post('/auth/reset-password', { token, newPassword });
            setMessage(response.data.message);
            setToken('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to reset password');
        }
    };

    return (
        <div className="auth-card glass-panel">
            <h2 className="auth-title">Account Recovery</h2>
            <p className="auth-subtitle">Generate reset token and set a new password</p>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={requestToken}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button className="btn btn-outline" type="submit">Generate Reset Token</button>
            </form>

            <form onSubmit={resetPassword} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Reset Token</label>
                    <input className="form-input" value={token} onChange={(e) => setToken(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit">Reset Password</button>
            </form>

            <div className="auth-footer">
                Back to <Link className="auth-link" to="/login">Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
