import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

const tabStyle = (active) => ({
    padding: '10px 22px',
    border: 'none',
    borderBottom: active ? '3px solid #0d6efd' : '3px solid transparent',
    background: 'none',
    fontWeight: active ? '700' : '500',
    color: active ? '#0d6efd' : '#555',
    cursor: 'pointer',
    fontSize: 15,
    transition: 'all 0.2s',
});

function Profile() {
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

    const [activeTab, setActiveTab] = useState('profile');

    // ── Profile Info ──────────────────────────────────────────────
    const [profile, setProfile] = useState({ username: '', email: '', phone: '', location: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const { username, email, phone, location } = res.data;
                setProfile({ username: username || '', email: email || '', phone: phone || '', location: location || '' });
            })
            .catch(() => setError('Failed to load profile.'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        setMessage(''); setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setMessage(''); setError('');
        try {
            await axios.put(`${API}/api/users/profile`, profile, { headers: { Authorization: `Bearer ${token}` } });
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally { setSaving(false); }
    };

    // ── My Bikes ──────────────────────────────────────────────────
    const [myBikes, setMyBikes] = useState([]);
    const [bikesLoading, setBikesLoading] = useState(false);
    const [bikesError, setBikesError] = useState('');
    const [bikeMsg, setBikeMsg] = useState('');

    // Edit modal state
    const [editBike, setEditBike] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [editMsg, setEditMsg] = useState('');

    const fetchMyBikes = useCallback(() => {
        if (!user?.id) return;
        setBikesLoading(true); setBikesError('');
        axios.get(`${API}/api/bikes?owner=${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setMyBikes(res.data))
            .catch(() => setBikesError('Failed to load your bikes.'))
            .finally(() => setBikesLoading(false));
    }, [user?.id, token]);

    useEffect(() => {
        if (activeTab === 'mybikes' || activeTab === 'customers') fetchMyBikes();
    }, [activeTab, fetchMyBikes]);

    const handleDelete = async (bikeId) => {
        if (!window.confirm('Are you sure you want to delete this bike?')) return;
        try {
            await axios.delete(`${API}/api/bikes/${bikeId}`, { headers: { Authorization: `Bearer ${token}` } });
            setBikeMsg('Bike deleted successfully.');
            setMyBikes(prev => prev.filter(b => b._id !== bikeId));
        } catch { setBikesError('Failed to delete bike.'); }
    };

    const handleToggleSold = async (bike) => {
        const endpoint = bike.sold ? 'available' : 'sold';
        try {
            const res = await axios.patch(`${API}/api/bikes/${bike._id}/${endpoint}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setMyBikes(prev => prev.map(b => b._id === bike._id ? res.data : b));
            setBikeMsg(`Bike marked as ${bike.sold ? 'Available' : 'Sold'}.`);
        } catch { setBikesError('Failed to update status.'); }
    };

    const openEdit = (bike) => {
        setEditBike(bike);
        setEditForm({
            brand: bike.brand, model: bike.model, location: bike.location,
            price: bike.price, description: bike.description, color: bike.color,
            ownersCount: bike.ownersCount, kilometresRun: bike.kilometresRun, modelYear: bike.modelYear,
        });
        setEditMsg('');
    };

    const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditSaving(true); setEditMsg('');
        try {
            const res = await axios.put(`${API}/api/bikes/${editBike._id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
            setMyBikes(prev => prev.map(b => b._id === editBike._id ? res.data : b));
            setEditMsg('Bike updated!');
            setTimeout(() => setEditBike(null), 1000);
        } catch (err) {
            setEditMsg(err.response?.data?.message || 'Update failed.');
        } finally { setEditSaving(false); }
    };

    // ── Customer Details ──────────────────────────────────────────
    const handleRemoveBuyer = async (bikeId, buyerId) => {
        if (!window.confirm('Remove this buyer from the list?')) return;
        try {
            const res = await axios.delete(`${API}/api/bikes/${bikeId}/book/${buyerId}`, { headers: { Authorization: `Bearer ${token}` } });
            setMyBikes(prev => prev.map(b => b._id === bikeId ? res.data : b));
        } catch { setBikesError('Failed to remove buyer.'); }
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
        <div className="container py-4" style={{ maxWidth: 900 }}>

            {/* Header Card */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body d-flex align-items-center gap-4 p-4" style={{ background: 'linear-gradient(135deg,#0d6efd 0%,#6610f2 100%)', borderRadius: 12 }}>
                    <div
                        className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 80, height: 80, fontSize: 32, color: '#0d6efd', flexShrink: 0 }}
                    >
                        {profile.username ? profile.username[0].toUpperCase() : '?'}
                    </div>
                    <div className="text-white">
                        <h3 className="fw-bold mb-1">{profile.username}</h3>
                        <p className="mb-0 opacity-75">{profile.email}</p>
                        <span className="badge bg-white text-primary mt-1">{user?.role === 'admin' ? 'Administrator' : 'Member'}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="d-flex border-bottom px-2">
                    {[
                        { key: 'profile', label: '👤 Profile Info' },
                        { key: 'mybikes', label: '🏍️ My Bikes' },
                        { key: 'customers', label: '📋 Customer Details' },
                    ].map(t => (
                        <button key={t.key} style={tabStyle(activeTab === t.key)} onClick={() => { setActiveTab(t.key); setBikeMsg(''); setBikesError(''); }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB: Profile Info ── */}
            {activeTab === 'profile' && (
                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">Edit Profile</h5>
                        {message && <div className="alert alert-success py-2">{message}</div>}
                        {error && <div className="alert alert-danger py-2">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Username</label>
                                    <input type="text" className="form-control" name="username" value={profile.username} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input type="email" className="form-control" name="email" value={profile.email} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Phone</label>
                                    <input type="text" className="form-control" name="phone" value={profile.phone} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Location</label>
                                    <input type="text" className="form-control" name="location" value={profile.location} onChange={handleChange} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary mt-4 px-5" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── TAB: My Bikes ── */}
            {activeTab === 'mybikes' && (
                <div>
                    {bikeMsg && <div className="alert alert-success py-2">{bikeMsg}</div>}
                    {bikesError && <div className="alert alert-danger py-2">{bikesError}</div>}

                    {bikesLoading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
                    ) : myBikes.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div style={{ fontSize: 48 }}>🏍️</div>
                                <h5 className="mt-3 text-muted">You haven't listed any bikes yet.</h5>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {myBikes.map(bike => (
                                <div key={bike._id} className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-3">
                                            <div className="d-flex gap-3 align-items-start">
                                                {/* Bike Image */}
                                                {bike.images && bike.images.length > 0 ? (
                                                    <img
                                                        src={`${API}${bike.images[0]}`}
                                                        alt={bike.model}
                                                        style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <div style={{ width: 120, height: 90, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🏍️</div>
                                                )}

                                                {/* Bike Info */}
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                        <div>
                                                            <h6 className="fw-bold mb-1">{bike.brand} {bike.model} <span style={{ fontSize: 13 }} className="text-muted">({bike.modelYear})</span></h6>
                                                            <p className="text-muted small mb-1">📍 {bike.location} &nbsp;|&nbsp; 🎨 {bike.color} &nbsp;|&nbsp; 📏 {bike.kilometresRun?.toLocaleString()} km</p>
                                                            <p className="fw-bold text-primary mb-0">₹{bike.price?.toLocaleString()}</p>
                                                        </div>
                                                        <span className={`badge ${bike.sold ? 'bg-danger' : 'bg-success'}`}>{bike.sold ? 'Sold' : 'Available'}</span>
                                                    </div>

                                                    <div className="d-flex gap-2 mt-3 flex-wrap">
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(bike)}>✏️ Edit</button>
                                                        <button
                                                            className={`btn btn-sm ${bike.sold ? 'btn-outline-success' : 'btn-outline-warning'}`}
                                                            onClick={() => handleToggleSold(bike)}
                                                        >
                                                            {bike.sold ? '✅ Mark Available' : '🔴 Mark Sold'}
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(bike._id)}>🗑️ Delete</button>
                                                        {bike.bookedBuyers && bike.bookedBuyers.length > 0 && (
                                                            <span className="badge bg-info text-dark align-self-center">
                                                                {bike.bookedBuyers.length} interested buyer{bike.bookedBuyers.length > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editBike && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16 }}>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Edit Bike — {editBike.brand} {editBike.model}</h5>
                                        <button className="btn-close" onClick={() => setEditBike(null)} />
                                    </div>
                                    {editMsg && <div className={`alert ${editMsg.includes('failed') || editMsg.includes('Failed') ? 'alert-danger' : 'alert-success'} py-2`}>{editMsg}</div>}
                                    <form onSubmit={handleEditSubmit}>
                                        <div className="row g-3">
                                            {[
                                                { name: 'brand', label: 'Brand' },
                                                { name: 'model', label: 'Model' },
                                                { name: 'location', label: 'Location' },
                                                { name: 'color', label: 'Color' },
                                                { name: 'price', label: 'Price (₹)', type: 'number' },
                                                { name: 'modelYear', label: 'Model Year', type: 'number' },
                                                { name: 'kilometresRun', label: 'Kilometres Run', type: 'number' },
                                                { name: 'ownersCount', label: 'Number of Owners', type: 'number' },
                                            ].map(f => (
                                                <div className="col-md-6" key={f.name}>
                                                    <label className="form-label fw-semibold small">{f.label}</label>
                                                    <input
                                                        type={f.type || 'text'}
                                                        className="form-control form-control-sm"
                                                        name={f.name}
                                                        value={editForm[f.name] || ''}
                                                        onChange={handleEditChange}
                                                    />
                                                </div>
                                            ))}
                                            <div className="col-12">
                                                <label className="form-label fw-semibold small">Description</label>
                                                <textarea className="form-control form-control-sm" name="description" rows={3} value={editForm.description || ''} onChange={handleEditChange} />
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2 mt-4">
                                            <button type="submit" className="btn btn-primary px-4" disabled={editSaving}>{editSaving ? 'Saving...' : 'Save Changes'}</button>
                                            <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditBike(null)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: Customer Details ── */}
            {activeTab === 'customers' && (
                <div>
                    {bikesError && <div className="alert alert-danger py-2">{bikesError}</div>}

                    {bikesLoading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
                    ) : myBikes.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div style={{ fontSize: 48 }}>🏍️</div>
                                <h5 className="mt-3 text-muted">You haven't listed any bikes yet.</h5>
                            </div>
                        </div>
                    ) : (
                        myBikes.map(bike => (
                            <div key={bike._id} className="card border-0 shadow-sm mb-3">
                                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                                    <div>
                                        <span className="fw-bold">{bike.brand} {bike.model}</span>
                                        <span className="text-muted small ms-2">({bike.modelYear}) — ₹{bike.price?.toLocaleString()}</span>
                                    </div>
                                    <span className={`badge ${bike.sold ? 'bg-danger' : 'bg-success'}`}>{bike.sold ? 'Sold' : 'Available'}</span>
                                </div>
                                <div className="card-body p-3">
                                    {(!bike.bookedBuyers || bike.bookedBuyers.length === 0) ? (
                                        <p className="text-muted mb-0 small">No customers have expressed interest yet.</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0" style={{ fontSize: 14 }}>
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>👤 Name</th>
                                                        <th>📞 Contact</th>
                                                        <th>📍 Location</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bike.bookedBuyers.map((buyer, idx) => (
                                                        <tr key={buyer._id || idx}>
                                                            <td className="text-muted">{idx + 1}</td>
                                                            <td className="fw-semibold">{buyer.username || 'N/A'}</td>
                                                            <td>
                                                                <a href={`tel:${buyer.contact}`} className="text-decoration-none">
                                                                    {buyer.contact || 'N/A'}
                                                                </a>
                                                            </td>
                                                            <td>{buyer.location || 'N/A'}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger py-0 px-2"
                                                                    onClick={() => handleRemoveBuyer(bike._id, buyer.userId)}
                                                                    title="Remove buyer"
                                                                >
                                                                    ✕ Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;
