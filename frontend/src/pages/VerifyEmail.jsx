import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useSearchParams } from 'react-router-dom';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const verify = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.get('/auth/verify-email', { params: { token } });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Email verification failed');
        }
    };

    return (
        <div className="auth-card glass-panel">
            <h2 className="auth-title">Verify Email</h2>
            <p className="auth-subtitle">Enter verification token received after signup</p>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={verify}>
                <div className="form-group">
                    <label className="form-label">Verification Token</label>
                    <input className="form-input" value={token} onChange={(e) => setToken(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit">Verify Email</button>
            </form>

            <div className="auth-footer">
                Back to <Link className="auth-link" to="/login">Login</Link>
            </div>
        </div>
    );
};

export default VerifyEmail;
