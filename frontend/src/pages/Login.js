import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../api/api';

const bgImage = 'https://t4.ftcdn.net/jpg/08/63/30/05/360_F_863300589_NojEYK8ktAoHEbIQEpTv8VUFAlMR49xx.jpg';

function Login() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.usernameOrEmail.trim()) errs.usernameOrEmail = 'Username or Email is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
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
      const res = await axios.post(`${API_URL}/api/users/login`, form);
      localStorage.setItem('token', res.data.token);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    background: 'rgba(255,255,255,0.07)',
    border: `1.5px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.14)'}`,
    borderRadius: 10,
    color: '#e6edf3',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    width: '100%',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
    transition: 'all 0.22s ease',
  });

  return (
    <>
      {/* Full-page blurred background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.35)',
        transform: 'scale(1.05)',
      }} />
      {/* Dark overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(13,17,23,0.72) 0%, rgba(15,32,39,0.80) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{
          width: '100%', maxWidth: 460,
          background: 'rgba(13,17,23,0.88)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.60)',
          padding: 'clamp(2rem, 6vw, 3rem)',
          animation: 'fadeInUp 0.5s ease both',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14, margin: '0 auto 1rem',
              border: '2px solid rgba(247,147,30,0.65)',
              overflow: 'hidden',
              boxShadow: '0 0 24px rgba(247,147,30,0.30)',
            }}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
                alt="BikeHouse Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem,5vw,2rem)', fontWeight: 800, color: '#fff',
              marginBottom: 6, letterSpacing: -0.5,
            }}>Welcome Back</h2>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '0.95rem' }}>
              Sign in to <span style={{ color: '#f7931e', fontWeight: 600 }}>BikeHouse</span>
            </p>
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} autoComplete="off">
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Username or Email</label>
              <input
                type="text"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="Enter your username or email"
                required autoFocus
                style={inputStyle(errors.usernameOrEmail)}
                onFocus={e => { e.target.style.borderColor = '#f7931e'; e.target.style.boxShadow = '0 0 0 3px rgba(247,147,30,0.18)'; }}
                onBlur={e => { e.target.style.borderColor = errors.usernameOrEmail ? '#ef4444' : 'rgba(255,255,255,0.14)'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.usernameOrEmail && <span style={errStyle}>{errors.usernameOrEmail}</span>}
            </div>

            <div style={{ marginBottom: '1.6rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={inputStyle(errors.password)}
                onFocus={e => { e.target.style.borderColor = '#f7931e'; e.target.style.boxShadow = '0 0 0 3px rgba(247,147,30,0.18)'; }}
                onBlur={e => { e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(255,255,255,0.14)'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.password && <span style={errStyle}>{errors.password}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem',
                background: loading ? 'rgba(247,147,30,0.5)' : 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
                border: 'none', borderRadius: 50, color: '#000',
                fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 24px rgba(247,147,30,0.35)',
                transition: 'all 0.22s ease', fontFamily: 'Poppins, sans-serif',
                letterSpacing: 0.5,
              }}
            >
              {loading ? 'Signing In...' : 'Login →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>Don't have an account? </span>
            <Link to="/signup" style={{ color: '#f7931e', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              Sign Up
            </Link>
          </div>

          {open && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)',
              borderRadius: 10, color: '#ef4444', fontSize: '0.88rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{message}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  display: 'block', color: '#8b949e', fontSize: '0.78rem',
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7,
};

const errStyle = {
  color: '#ef4444', fontSize: '0.80rem', marginTop: 5, display: 'block',
};

export default Login;