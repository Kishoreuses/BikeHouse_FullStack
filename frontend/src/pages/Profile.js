import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import API_URL from '../api/api';

const dark = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#0f1923 100%)', padding: '2rem 1rem' },
  card: { background: 'rgba(22,27,34,0.90)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.40)', marginBottom: '1.5rem' },
  input: { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e6edf3', padding: '0.7rem 1rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', outline: 'none', width: '100%', transition: 'border-color 0.2s' },
  label: { display: 'block', color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 },
  btn: { background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)', border: 'none', borderRadius: 50, color: '#000', fontWeight: 700, padding: '0.65rem 2rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(247,147,30,0.30)', transition: 'all 0.22s ease' },
  btnOutline: { background: 'transparent', border: '1.5px solid rgba(255,255,255,0.20)', borderRadius: 50, color: '#e6edf3', fontWeight: 600, padding: '0.55rem 1.6rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem' },
};

const tabStyle = (active) => ({
  padding: '12px 18px', border: 'none', background: 'none',
  fontWeight: active ? 700 : 500, cursor: 'pointer', fontSize: 14,
  fontFamily: 'Poppins,sans-serif', transition: 'all 0.2s',
  color: active ? '#f7931e' : 'rgba(255,255,255,0.60)',
  borderBottom: active ? '2px solid #f7931e' : '2px solid transparent',
  whiteSpace: 'nowrap',
});

function Profile() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  const [activeTab, setActiveTab] = useState('profile');

  // ── Profile Info ───────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ username: '', email: '', phone: '', location: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const { username, email, phone, location, profileImage: img } = res.data;
        setProfile({ username: username || '', email: email || '', phone: phone || '', location: location || '' });
        if (img) setImagePreview(`${API_URL}${img}`);
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => { setProfile({ ...profile, [e.target.name]: e.target.value }); setMessage(''); setError(''); };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (profileImage) formData.append('profileImage', profileImage);

      const res = await axios.put(`${API_URL}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Profile updated successfully!');
      if (res.data.profileImage) setImagePreview(`${API_URL}${res.data.profileImage}`);
      setProfileImage(null);

      // Notify navbar
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profileData: res.data } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  // ── My Bikes ───────────────────────────────────────────────────────────
  const [myBikes, setMyBikes] = useState([]);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [bikesError, setBikesError] = useState('');
  const [bikeMsg, setBikeMsg] = useState('');
  const [editBike, setEditBike] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  const fetchMyBikes = useCallback(() => {
    if (!user?.id) return;
    setBikesLoading(true); setBikesError('');
    axios.get(`${API_URL}/api/bikes?owner=${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
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
      await axios.delete(`${API_URL}/api/bikes/${bikeId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBikeMsg('Bike deleted successfully.');
      setMyBikes(prev => prev.filter(b => b._id !== bikeId));
    } catch { setBikesError('Failed to delete bike.'); }
  };

  const handleToggleSold = async (bike) => {
    const endpoint = bike.sold ? 'available' : 'sold';
    try {
      const res = await axios.patch(`${API_URL}/api/bikes/${bike._id}/${endpoint}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMyBikes(prev => prev.map(b => b._id === bike._id ? res.data : b));
      setBikeMsg(`Bike marked as ${bike.sold ? 'Available' : 'Sold'}.`);
    } catch { setBikesError('Failed to update status.'); }
  };

  const openEdit = (bike) => {
    setEditBike(bike);
    setEditForm({ brand: bike.brand, model: bike.model, location: bike.location, price: bike.price, description: bike.description, color: bike.color, ownersCount: bike.ownersCount, kilometresRun: bike.kilometresRun, modelYear: bike.modelYear });
    setEditMsg('');
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setEditSaving(true); setEditMsg('');
    try {
      const res = await axios.put(`${API_URL}/api/bikes/${editBike._id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      setMyBikes(prev => prev.map(b => b._id === editBike._id ? res.data : b));
      setEditMsg('Bike updated!');
      setTimeout(() => setEditBike(null), 1000);
    } catch (err) { setEditMsg(err.response?.data?.message || 'Update failed.'); }
    finally { setEditSaving(false); }
  };

  // ── Customer Details ───────────────────────────────────────────────────
  const handleRemoveBuyer = async (bikeId, buyerId) => {
    if (!window.confirm('Remove this buyer from the list?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/bikes/${bikeId}/book/${buyerId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMyBikes(prev => prev.map(b => b._id === bikeId ? res.data : b));
    } catch { setBikesError('Failed to remove buyer.'); }
  };

  // ── Password Change ────────────────────────────────────────────────────
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

  const handlePassSubmit = async (e) => {
    e.preventDefault(); setPassMsg(''); setPassErr('');
    if (passForm.newPassword !== passForm.confirmPassword) return setPassErr('New passwords do not match.');
    if (passForm.newPassword.length < 6) return setPassErr('Password must be at least 6 characters.');
    setPassLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/users/change-password`,
        { oldPassword: passForm.oldPassword, newPassword: passForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassMsg(res.data.message);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPassErr(err.response?.data?.message || 'Failed to change password.'); }
    finally { setPassLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" style={{ width: 56, height: 56, color: '#f7931e', borderWidth: 3 }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const initials = profile.username ? profile.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bh-page" style={dark.page}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Header Card ── */}
        <div style={dark.card}>
          {/* Banner */}
          <div style={{ height: 100, background: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)', borderRadius: '20px 20px 0 0', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: -50, left: 28, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              {/* Avatar with upload */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  border: '4px solid rgba(22,27,34,0.90)',
                  overflow: 'hidden', background: '#1c2333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 3px rgba(247,147,30,0.55)',
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 40, fontWeight: 900, color: '#f7931e' }}>{initials}</span>
                  )}
                </div>
                {/* Camera icon overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#f7931e,#ffd700)',
                    border: '2px solid rgba(22,27,34,0.90)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 13,
                  }}
                  title="Change profile photo"
                >📷</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              </div>
            </div>
          </div>

          {/* Profile info strip */}
          <div style={{ padding: '64px 28px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', margin: '0 0 4px', letterSpacing: -0.3 }}>{profile.username}</h3>
                <p style={{ color: '#8b949e', margin: 0, fontSize: '0.9rem' }}>{profile.email || 'No email set'}</p>
                <span style={{
                  display: 'inline-block', marginTop: 8,
                  background: user?.role === 'admin' ? 'rgba(247,147,30,0.18)' : 'rgba(34,197,94,0.18)',
                  border: `1px solid ${user?.role === 'admin' ? 'rgba(247,147,30,0.45)' : 'rgba(34,197,94,0.45)'}`,
                  color: user?.role === 'admin' ? '#f7931e' : '#22c55e',
                  borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {user?.role === 'admin' ? '⭐ Administrator' : '✓ Member'}
                </span>
              </div>
              {imagePreview && profileImage && (
                <button onClick={handleSubmit} disabled={saving} style={{ ...dark.btn, padding: '0.5rem 1.4rem', fontSize: '0.82rem' }}>
                  {saving ? 'Saving...' : '💾 Save Photo'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto', padding: '0 12px' }}>
            {[
              { key: 'profile', label: '👤 Profile' },
              { key: 'mybikes', label: '🏍️ My Bikes' },
              { key: 'customers', label: '📋 Customers' },
              { key: 'security', label: '🔒 Security' },
            ].map(t => (
              <button key={t.key} style={tabStyle(activeTab === t.key)} onClick={() => {
                setActiveTab(t.key); setBikeMsg(''); setBikesError(''); setPassMsg(''); setPassErr('');
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: Profile Info ── */}
        {activeTab === 'profile' && (
          <div style={dark.card}>
            <div style={{ padding: '1.8rem 2rem' }}>
              <h5 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Edit Profile</h5>
              <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', borderRadius: 2, marginBottom: '1.5rem' }} />
              {message && <Toast type="success" msg={message} />}
              {error && <Toast type="danger" msg={error} />}
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    { name: 'username', label: 'Username', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'phone', label: 'Phone', type: 'text' },
                    { name: 'location', label: 'Location', type: 'text' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={dark.label}>{f.label}</label>
                      <input
                        type={f.type} name={f.name} value={profile[f.name]} onChange={handleChange}
                        style={dark.input} required={f.name === 'username'}
                        onFocus={e => { e.target.style.borderColor = '#f7931e'; e.target.style.boxShadow = '0 0 0 3px rgba(247,147,30,0.15)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}
                </div>

                {/* Profile Photo Upload */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={dark.label}>Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                      border: '2px solid rgba(247,147,30,0.55)',
                      background: '#1c2333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {imagePreview
                        ? <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 28, fontWeight: 900, color: '#f7931e' }}>{initials}</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="file" accept="image/*" onChange={handleImageSelect} ref={fileInputRef}
                        style={{ display: 'none' }} id="profileImgInput" />
                      <label htmlFor="profileImgInput" style={{
                        display: 'inline-block', cursor: 'pointer',
                        border: '2px dashed rgba(247,147,30,0.40)', borderRadius: 10,
                        padding: '0.65rem 1.4rem', color: '#f7931e', fontSize: '0.88rem', fontWeight: 600,
                        background: 'rgba(247,147,30,0.06)', transition: 'all 0.2s',
                      }}>
                        📷 Choose Photo
                      </label>
                      <span style={{ color: '#8b949e', fontSize: '0.80rem', marginLeft: 12 }}>
                        {profileImage ? profileImage.name : 'JPG, PNG up to 5MB'}
                      </span>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving} style={{ ...dark.btn, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB: My Bikes ── */}
        {activeTab === 'mybikes' && (
          <div>
            {bikeMsg && <Toast type="success" msg={bikeMsg} />}
            {bikesError && <Toast type="danger" msg={bikesError} />}
            {bikesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner-border" style={{ width: 48, height: 48, color: '#f7931e', borderWidth: 3 }} role="status" />
              </div>
            ) : myBikes.length === 0 ? (
              <div style={{ ...dark.card, textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: 56, marginBottom: '1rem' }}>🏍️</div>
                <h5 style={{ color: '#e6edf3', fontWeight: 700 }}>No bikes listed yet</h5>
                <p style={{ color: '#8b949e' }}>Go to <strong style={{ color: '#f7931e' }}>Sell Bike</strong> to list your first bike.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myBikes.map(bike => (
                  <div key={bike._id} style={dark.card}>
                    <div style={{ padding: '1.2rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {/* Bike image */}
                      <div style={{ width: 140, height: 100, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#1c2333' }}>
                        {bike.images && bike.images[0]
                          ? <img src={`${API_URL}${bike.images[0]}`} alt={bike.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏍️</div>
                        }
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <h6 style={{ color: '#fff', fontWeight: 800, marginBottom: 4, fontSize: '1rem' }}>{bike.brand} {bike.model} <span style={{ color: '#8b949e', fontWeight: 400, fontSize: 13 }}>({bike.modelYear})</span></h6>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              {[['📍', bike.location], ['🎨', bike.color], ['🛣️', `${bike.kilometresRun?.toLocaleString()} km`]].map(([icon, val], i) => (
                                <span key={i} style={{ color: '#8b949e', fontSize: '0.82rem' }}>{icon} {val}</span>
                              ))}
                            </div>
                            <div style={{ marginTop: 6, fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg,#f7931e,#ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                              ₹{bike.price?.toLocaleString()}
                            </div>
                          </div>
                          <span style={{
                            background: bike.sold ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)',
                            border: `1px solid ${bike.sold ? 'rgba(239,68,68,0.45)' : 'rgba(34,197,94,0.45)'}`,
                            color: bike.sold ? '#ef4444' : '#22c55e',
                            borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: '0.80rem', height: 'fit-content',
                          }}>{bike.sold ? 'Sold' : 'Available'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: '1rem', flexWrap: 'wrap' }}>
                          <button onClick={() => openEdit(bike)} style={{ ...dark.btnOutline, fontSize: '0.80rem', padding: '5px 14px' }}>✏️ Edit</button>
                          <button onClick={() => handleToggleSold(bike)} style={{ ...dark.btnOutline, fontSize: '0.80rem', padding: '5px 14px', borderColor: bike.sold ? 'rgba(34,197,94,0.45)' : 'rgba(247,147,30,0.45)', color: bike.sold ? '#22c55e' : '#f7931e' }}>
                            {bike.sold ? '✅ Mark Available' : '🔴 Mark Sold'}
                          </button>
                          <button onClick={() => handleDelete(bike._id)} style={{ ...dark.btnOutline, fontSize: '0.80rem', padding: '5px 14px', borderColor: 'rgba(239,68,68,0.45)', color: '#ef4444' }}>🗑️ Delete</button>
                          {bike.bookedBuyers?.length > 0 && (
                            <span style={{ background: 'rgba(30,136,229,0.18)', border: '1px solid rgba(30,136,229,0.35)', borderRadius: 20, padding: '4px 12px', color: '#64b5f6', fontSize: '0.78rem', fontWeight: 600, alignSelf: 'center' }}>
                              {bike.bookedBuyers.length} buyer{bike.bookedBuyers.length > 1 ? 's' : ''} interested
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Modal */}
            {editBike && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                onClick={() => setEditBike(null)}>
                <div style={{ ...dark.card, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', margin: 0 }}
                  onClick={e => e.stopPropagation()}>
                  <div style={{ padding: '1.5rem 1.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                      <h5 style={{ color: '#fff', fontWeight: 800, margin: 0 }}>✏️ Edit — {editBike.brand} {editBike.model}</h5>
                      <button onClick={() => setEditBike(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, width: 32, height: 32, color: '#e6edf3', cursor: 'pointer', fontSize: 14 }}>✕</button>
                    </div>
                    {editMsg && <Toast type={editMsg.includes('fail') || editMsg.includes('Failed') ? 'danger' : 'success'} msg={editMsg} />}
                    <form onSubmit={handleEditSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                        {[
                          { name: 'brand', label: 'Brand' }, { name: 'model', label: 'Model' },
                          { name: 'location', label: 'Location' }, { name: 'color', label: 'Color' },
                          { name: 'price', label: 'Price (₹)', type: 'number' }, { name: 'modelYear', label: 'Model Year', type: 'number' },
                          { name: 'kilometresRun', label: 'KM Run', type: 'number' }, { name: 'ownersCount', label: 'No. of Owners', type: 'number' },
                        ].map(f => (
                          <div key={f.name}>
                            <label style={dark.label}>{f.label}</label>
                            <input type={f.type || 'text'} name={f.name} value={editForm[f.name] || ''} onChange={handleEditChange}
                              style={{ ...dark.input, padding: '0.6rem 0.85rem', fontSize: '0.85rem' }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: '1.2rem' }}>
                        <label style={dark.label}>Description</label>
                        <textarea name="description" rows={3} value={editForm.description || ''} onChange={handleEditChange}
                          style={{ ...dark.input, resize: 'vertical', minHeight: 80 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" disabled={editSaving} style={{ ...dark.btn, opacity: editSaving ? 0.6 : 1 }}>
                          {editSaving ? 'Saving...' : '💾 Save Changes'}
                        </button>
                        <button type="button" onClick={() => setEditBike(null)} style={dark.btnOutline}>Cancel</button>
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
            {bikesError && <Toast type="danger" msg={bikesError} />}
            {bikesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner-border" style={{ width: 48, height: 48, color: '#f7931e', borderWidth: 3 }} role="status" />
              </div>
            ) : myBikes.length === 0 ? (
              <div style={{ ...dark.card, textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: 56 }}>🏍️</div>
                <h5 style={{ color: '#e6edf3', fontWeight: 700, marginTop: '1rem' }}>No bikes listed yet</h5>
              </div>
            ) : (
              myBikes.map(bike => (
                <div key={bike._id} style={{ ...dark.card, marginBottom: '1rem' }}>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{bike.brand} {bike.model}</span>
                      <span style={{ color: '#8b949e', fontSize: '0.82rem', marginLeft: 8 }}>({bike.modelYear}) — ₹{bike.price?.toLocaleString()}</span>
                    </div>
                    <span style={{ background: bike.sold ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)', border: `1px solid ${bike.sold ? 'rgba(239,68,68,0.45)' : 'rgba(34,197,94,0.45)'}`, color: bike.sold ? '#ef4444' : '#22c55e', borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {bike.sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                  <div style={{ padding: '1rem 1.5rem' }}>
                    {(!bike.bookedBuyers || bike.bookedBuyers.length === 0) ? (
                      <p style={{ color: '#8b949e', margin: 0, fontSize: '0.88rem' }}>No customers have expressed interest yet.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                          <thead>
                            <tr>{['#', '👤 Name', '📞 Contact', '📍 Location', 'Action'].map(h => (
                              <th key={h} style={{ background: 'rgba(247,147,30,0.10)', color: '#f7931e', fontWeight: 700, padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(247,147,30,0.18)' }}>{h}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {bike.bookedBuyers.map((buyer, idx) => (
                              <tr key={buyer._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <td style={{ color: '#8b949e', padding: '10px 12px', fontSize: '0.85rem' }}>{idx + 1}</td>
                                <td style={{ color: '#e6edf3', padding: '10px 12px', fontWeight: 600, fontSize: '0.88rem' }}>{buyer.username || 'N/A'}</td>
                                <td style={{ color: '#c9d1d9', padding: '10px 12px', fontSize: '0.85rem' }}><a href={`tel:${buyer.contact}`} style={{ color: '#f7931e', textDecoration: 'none' }}>{buyer.contact || 'N/A'}</a></td>
                                <td style={{ color: '#c9d1d9', padding: '10px 12px', fontSize: '0.85rem' }}>{buyer.location || 'N/A'}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <button onClick={() => handleRemoveBuyer(bike._id, buyer.userId)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)', borderRadius: 20, color: '#ef4444', fontWeight: 600, padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Poppins,sans-serif' }}>
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

        {/* ── TAB: Security ── */}
        {activeTab === 'security' && (
          <div style={dark.card}>
            <div style={{ padding: '1.8rem 2rem' }}>
              <h5 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.1rem' }}>🔒 Change Password</h5>
              <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', borderRadius: 2, marginBottom: '1.5rem' }} />
              {passMsg && <Toast type="success" msg={passMsg} />}
              {passErr && <Toast type="danger" msg={passErr} />}
              <form onSubmit={handlePassSubmit} style={{ maxWidth: 460 }}>
                {[
                  { name: 'oldPassword', label: 'Current Password' },
                  { name: 'newPassword', label: 'New Password' },
                  { name: 'confirmPassword', label: 'Confirm New Password' },
                ].map(f => (
                  <div key={f.name} style={{ marginBottom: '1.1rem' }}>
                    <label style={dark.label}>{f.label}</label>
                    <input type="password" name={f.name} value={passForm[f.name]} onChange={handlePassChange}
                      style={dark.input} required
                      onFocus={e => { e.target.style.borderColor = '#f7931e'; e.target.style.boxShadow = '0 0 0 3px rgba(247,147,30,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={passLoading} style={{ ...dark.btn, marginTop: 8, opacity: passLoading ? 0.6 : 1 }}>
                  {passLoading ? 'Updating...' : '🔑 Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Toast({ type, msg }) {
  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.40)', color: '#22c55e' },
    danger: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.40)', color: '#ef4444' },
    info: { bg: 'rgba(30,136,229,0.15)', border: 'rgba(30,136,229,0.40)', color: '#64b5f6' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '0.7rem 1rem', color: c.color, fontWeight: 600, fontSize: '0.88rem', marginBottom: '1rem' }}>
      {msg}
    </div>
  );
}

export default Profile;
