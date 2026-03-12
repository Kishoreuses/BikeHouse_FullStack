import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SaleBike from './pages/SaleBike';
import BikeMarketplace from './pages/BikeMarketplace';
import Profile from './pages/Profile';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import BikeDetails from './pages/BikeDetails';
import BackgroundAnimation from './components/BackgroundAnimation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from './api/api';

function SalesDetails() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    axios.get(`${API_URL}/api/admin/bikes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSales(res.data.filter(b => b.sold));
      })
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div style={pageWrap}>
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)', borderRadius: 12, padding: '1rem 1.5rem', color: '#ef4444', fontWeight: 600 }}>
          Not authorized. Admins only.
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={glassCard}>
        <h2 style={pageTitle}>📈 Sales Details</h2>
        <div style={{ width: 50, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', borderRadius: 2, marginBottom: '1.5rem' }} />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner-border" style={{ width: 50, height: 50, color: '#f7931e', borderWidth: 3 }} role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableSt}>
              <thead>
                <tr>{['Bike', 'Seller', 'Buyer', 'Posted', 'Sold'].map(h => <th key={h} style={thSt}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {sales.length === 0 && <tr><td colSpan={5} style={tdCenterSt}>No sales found.</td></tr>}
                {sales.map(bike => (
                  <tr key={bike._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={tdSt}><span style={{ color: '#fff', fontWeight: 700 }}>{bike.brand} {bike.model}</span></td>
                    <td style={tdSt}>{bike.owner?.username || 'N/A'}</td>
                    <td style={tdSt}>{bike.buyer?.username || 'N/A'}</td>
                    <td style={tdSt}>{bike.createdAt ? new Date(bike.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td style={tdSt}>{bike.soldAt ? new Date(bike.soldAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function UserDetails() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeleting(userId);
    try {
      await axios.delete(`${API_URL}/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u._id !== userId));
      setMessage('User deleted successfully.');
    } catch (err) {
      setMessage('Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };

  if (!isAdmin) {
    return (
      <div style={pageWrap}>
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)', borderRadius: 12, padding: '1rem 1.5rem', color: '#ef4444', fontWeight: 600 }}>
          Not authorized. Admins only.
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={glassCard}>
        <h2 style={pageTitle}>👥 User Details</h2>
        <div style={{ width: 50, height: 3, background: 'linear-gradient(90deg,#f7931e,#ffd700)', borderRadius: 2, marginBottom: '1.5rem' }} />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner-border" style={{ width: 50, height: 50, color: '#f7931e', borderWidth: 3 }} role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableSt}>
              <thead>
                <tr>{['Username', 'Email', 'Phone', 'Location', 'Registered', 'Actions'].map(h => <th key={h} style={thSt}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.length === 0 && <tr><td colSpan={6} style={tdCenterSt}>No users found.</td></tr>}
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={tdSt}><span style={{ color: '#fff', fontWeight: 700 }}>{u.username}</span></td>
                    <td style={tdSt}>{u.email || '—'}</td>
                    <td style={tdSt}>{u.phone || '—'}</td>
                    <td style={tdSt}>{u.location || '—'}</td>
                    <td style={tdSt}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={tdSt}>
                      <button
                        style={{
                          background: 'rgba(239,68,68,0.18)', border: '1.5px solid rgba(239,68,68,0.40)',
                          borderRadius: 50, color: '#ef4444', fontWeight: 700, padding: '5px 16px',
                          cursor: deleting === u._id ? 'not-allowed' : 'pointer', fontSize: '0.80rem', fontFamily: 'Poppins, sans-serif',
                          opacity: deleting === u._id ? 0.6 : 1,
                        }}
                        disabled={deleting === u._id}
                        onClick={() => handleDelete(u._id)}
                      >{deleting === u._id ? 'Deleting...' : 'Delete'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {message && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.40)', borderRadius: 10, color: '#22c55e', fontWeight: 600, fontSize: '0.88rem' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const pageWrap = { minHeight: '100vh', background: 'linear-gradient(180deg,#0d1117 0%,#0f1923 100%)', padding: '2.5rem 1.5rem' };
const glassCard = { background: 'rgba(22,27,34,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', maxWidth: 1100, margin: '0 auto' };
const pageTitle = { color: '#fff', fontWeight: 900, fontSize: 'clamp(1.3rem,3vw,1.8rem)', marginBottom: 8, letterSpacing: -0.5 };
const tableSt = { width: '100%', borderCollapse: 'collapse', minWidth: 600 };
const thSt = { background: 'rgba(247,147,30,0.12)', color: '#f7931e', fontWeight: 700, padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(247,147,30,0.20)' };
const tdSt = { color: '#c9d1d9', padding: '11px 14px', fontSize: '0.88rem', verticalAlign: 'middle' };
const tdCenterSt = { ...tdSt, textAlign: 'center', color: '#8b949e', padding: '2rem' };

function App() {
  const token = localStorage.getItem('token');
  // const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  return (
    <Router>
      <BackgroundAnimation />
      <Navbar />
      <Routes>
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/sale" element={<ProtectedRoute><SaleBike /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><BikeMarketplace /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/bike/:id" element={<ProtectedRoute><BikeDetails /></ProtectedRoute>} />
        <Route path="/sales" element={<SalesDetails />} />
        <Route path="/users" element={<UserDetails />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;