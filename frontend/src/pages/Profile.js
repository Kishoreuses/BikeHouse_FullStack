import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

    const [profile, setProfile] = useState({ username: '', email: '', phone: '', location: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const { username, email, phone, location } = res.data;
                setProfile({
                    username: username || '',
                    email: email || '',
                    phone: phone || '',
                    location: location || ''
                });
            })
            .catch(() => setError('Failed to load profile.'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        try {
            await axios.put('http://localhost:5000/api/users/profile', profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" style={{ width: 60, height: 60 }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: 600 }}>
            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="text-center mb-4">
                        <div
                            className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold mb-3"
                            style={{ width: 80, height: 80, fontSize: 32 }}
                        >
                            {profile.username ? profile.username[0].toUpperCase() : '?'}
                        </div>
                        <h3 className="fw-bold">{profile.username}</h3>
                        <p className="text-muted small">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
                    </div>

                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                value={profile.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Phone</label>
                            <input
                                type="text"
                                className="form-control"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Location</label>
                            <input
                                type="text"
                                className="form-control"
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
