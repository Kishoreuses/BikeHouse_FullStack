import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_URL from '../api/api';

function BikeDetails() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const token = localStorage.getItem('token');
  let user = null;
  if (token) { try { user = JSON.parse(atob(token.split('.')[1])); } catch { } }

  useEffect(() => {
    axios.get(`${API_URL}/api/bikes/${id}`).then(res => setBike(res.data));
  }, [id]);

  const handleMarkAsSold = async () => {
    try {
      const res = await axios.patch(`${API_URL}/api/bikes/${id}/sold`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBike(res.data); setMessage('Bike marked as sold!'); setOpen(true);
    } catch { setMessage('Failed to mark as sold'); setOpen(true); }
  };

  if (!bike) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <div className="spinner-border" style={{ width: 56, height: 56, color: '#f7931e', borderWidth: 3 }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const canMarkAsSold = !bike.sold && user && (user.role === 'admin' || (bike.owner && bike.owner._id === user.id));

  const specs = [
    { icon: '📍', label: 'Location', value: bike.location },
    { icon: '👤', label: 'Owner', value: bike.owner?.username },
    { icon: '🎨', label: 'Color', value: bike.color },
    { icon: '👥', label: 'No. of Owners', value: bike.ownersCount },
    { icon: '🛣️', label: 'Kilometres Run', value: bike.kilometresRun ? `${bike.kilometresRun} km` : '' },
    { icon: '📅', label: 'Model Year', value: bike.modelYear },
    { icon: '📝', label: 'RC', value: bike.rc?.length > 0 ? `${bike.rc.length} file(s)` : 'N/A' },
    { icon: '🛡️', label: 'Insurance', value: bike.insurance?.length > 0 ? `${bike.insurance.length} file(s)` : 'N/A' },
    { icon: '🕐', label: 'Posted On', value: bike.postedOn ? new Date(bike.postedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '' },
  ];

  return (
    <div className="bh-page" style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#0f1923 100%)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Back button */}
        <button onClick={() => window.history.back()} style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, color: '#e6edf3', padding: '8px 20px', cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem',
          transition: 'all 0.2s',
        }}>← Back</button>

        <div style={{
          background: 'rgba(22,27,34,0.90)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20,
          overflow: 'hidden', boxShadow: '0 16px 56px rgba(0,0,0,0.55)',
          animation: 'fadeInUp 0.45s ease both',
        }}>

          {/* Image gallery */}
          {bike.images && bike.images[0] && (
            <div>
              <div style={{ position: 'relative', height: 'clamp(220px,40vw,380px)', overflow: 'hidden' }}>
                <img
                  src={`${API_URL}${bike.images[activeImg]}`}
                  alt={bike.model}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.4s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(13,17,23,0.75) 0%,transparent 50%)' }} />
                {/* Price overlay */}
                <div style={{
                  position: 'absolute', bottom: 16, left: 20,
                  fontSize: '2rem', fontWeight: 900,
                  background: 'linear-gradient(135deg,#f7931e,#ffd700)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', lineHeight: 1,
                }}>₹{bike.price?.toLocaleString('en-IN')}</div>
                {/* Status */}
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  {bike.sold ? (
                    <span style={{ background: 'rgba(239,68,68,0.22)', border: '1px solid rgba(239,68,68,0.50)', color: '#ef4444', borderRadius: 20, padding: '5px 14px', fontWeight: 700, fontSize: '0.82rem' }}>
                      ✕ SOLD
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.45)', color: '#22c55e', borderRadius: 20, padding: '5px 14px', fontWeight: 700, fontSize: '0.82rem' }}>
                      ✓ Available
                    </span>
                  )}
                </div>
              </div>
              {/* Thumbnails */}
              {bike.images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: 'rgba(0,0,0,0.25)', flexWrap: 'wrap' }}>
                  {bike.images.map((img, i) => (
                    <img key={i} src={`${API_URL}${img}`} alt="" onClick={() => setActiveImg(i)}
                      style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', border: `2px solid ${activeImg === i ? '#f7931e' : 'transparent'}`, opacity: activeImg === i ? 1 : 0.6 }} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ padding: 'clamp(1.2rem,4vw,2rem)' }}>
            {/* Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: '#f7931e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>{bike.brand}</span>
              <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1.4rem,4vw,2.2rem)', margin: '4px 0 10px', letterSpacing: -0.5 }}>{bike.model}</h1>
              {bike.sold && bike.soldAt && (
                <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: 0 }}>Sold on {new Date(bike.soldAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              )}
            </div>

            {/* Specs grid */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ color: '#f7931e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: '1rem' }}>Specifications</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem' }}>
                {specs.map((s, i) => s.value ? (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                    <div>
                      <div style={{ color: '#6e7681', fontSize: '0.70rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.90rem', marginTop: 2 }}>{s.value}</div>
                    </div>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Description */}
            {bike.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ color: '#f7931e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Description</h5>
                <p style={{ color: '#c9d1d9', lineHeight: 1.7, margin: 0, fontSize: '0.93rem', background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>{bike.description}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {canMarkAsSold && (
                <button onClick={handleMarkAsSold} style={{
                  background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none', borderRadius: 50,
                  color: '#fff', fontWeight: 700, padding: '10px 28px', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif', fontSize: '0.92rem', boxShadow: '0 6px 20px rgba(239,68,68,0.35)',
                }}>Mark as Sold</button>
              )}
              <button onClick={() => window.history.back()} style={{
                background: 'transparent', border: '1.5px solid rgba(255,255,255,0.20)', borderRadius: 50,
                color: '#e6edf3', fontWeight: 600, padding: '10px 28px', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif', fontSize: '0.92rem',
              }}>← Go Back</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        {open && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.45)',
            backdropFilter: 'blur(12px)', borderRadius: 12, padding: '0.75rem 1.2rem',
            color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span>{message}</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BikeDetails;