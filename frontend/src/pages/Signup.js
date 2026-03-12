import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../api/api';

const bgImage = 'https://t4.ftcdn.net/jpg/08/63/30/05/360_F_863300589_NojEYK8ktAoHEbIQEpTv8VUFAlMR49xx.jpg';

function Signup() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '',
    phone: '', location: '', address: ''
  });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Phone number must be 10 digits';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    return errs;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/signup`, form);
      setMessage('Signup successful! Redirecting...');
      setOpen(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    background: 'rgba(255,255,255,0.07)',
    border: `1.5px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.14)'}`,
    borderRadius: 10, color: '#e6edf3',
    padding: '0.68rem 0.9rem', fontSize: '0.9rem',
    width: '100%', fontFamily: 'Poppins, sans-serif', outline: 'none',
    transition: 'all 0.22s ease',
  });

  const onFocus = e => { e.target.style.borderColor = '#f7931e'; e.target.style.boxShadow = '0 0 0 3px rgba(247,147,30,0.18)'; };
  const onBlur = (hasErr) => e => { e.target.style.borderColor = hasErr ? '#ef4444' : 'rgba(255,255,255,0.14)'; e.target.style.boxShadow = 'none'; };

  const fields = [
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'John', half: true },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe', half: true },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe', half: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210', half: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', half: true },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Chennai, TN', half: true },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Your full address', half: false },
  ];

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.35)', transform: 'scale(1.05)',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(13,17,23,0.72) 0%, rgba(15,32,39,0.80) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem 1rem',
      }}>
        <div style={{
          width: '100%', maxWidth: 700,
          background: 'rgba(13,17,23,0.88)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.60)',
          padding: 'clamp(1.8rem, 5vw, 2.8rem)',
          animation: 'fadeInUp 0.5s ease both',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 12, margin: '0 auto 1rem',
              border: '2px solid rgba(247,147,30,0.65)', overflow: 'hidden',
              boxShadow: '0 0 24px rgba(247,147,30,0.30)',
            }}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
                alt="BikeHouse Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>
              Create Your Account
            </h2>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '0.9rem' }}>
              Join <span style={{ color: '#f7931e', fontWeight: 600 }}>BikeHouse</span> and start your journey!
            </p>
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} autoComplete="off">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {fields.map(f => (
                <div key={f.name} style={{ gridColumn: f.half ? 'span 1' : 'span 2' }}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    required
                    style={inputStyle(errors[f.name])}
                    onFocus={onFocus}
                    onBlur={onBlur(errors[f.name])}
                  />
                  {errors[f.name] && <span style={errStyle}>{errors[f.name]}</span>}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: '1.6rem', padding: '0.85rem',
                background: loading ? 'rgba(247,147,30,0.5)' : 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
                border: 'none', borderRadius: 50, color: '#000',
                fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 24px rgba(247,147,30,0.35)',
                transition: 'all 0.22s ease', fontFamily: 'Poppins, sans-serif',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
            <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#f7931e', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Login</Link>
          </div>

          {open && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 1rem',
              background: message.includes('successful') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${message.includes('successful') ? 'rgba(34,197,94,0.40)' : 'rgba(239,68,68,0.40)'}`,
              borderRadius: 10,
              color: message.includes('successful') ? '#22c55e' : '#ef4444',
              fontSize: '0.88rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{message}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  display: 'block', color: '#8b949e', fontSize: '0.76rem',
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
};

const errStyle = {
  color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block',
};

export default Signup;