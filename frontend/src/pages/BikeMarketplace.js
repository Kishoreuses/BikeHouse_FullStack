import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api/api';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Badge from '@mui/material/Badge';

const brands = ['Hero', 'Honda', 'Yamaha', 'Royal Enfield', 'Suzuki', 'Bajaj', 'TVS', 'KTM', 'Other'];

const cardStyle = {
  background: '#131c27',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
};

const inputS = {
  background: 'rgba(255,255,255,0.07)',
  border: '1.5px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#e6edf3',
  padding: '0.65rem 1rem',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
};

const selectS = {
  ...inputS,
  background: 'rgba(22,27,34,0.92)',
};

function BikeMarketplace() {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [bookingLoading, setBookingLoading] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBikes();
    if (token) { fetchCartItems(); fetchUserProfile(); }
    // eslint-disable-next-line
  }, [token]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { applyFilters(); }, [bikes, selectedBrand, priceRange, searchQuery, sortBy, userProfile]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setUserProfile(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/bikes`);
      const availableBikes = response.data.filter(bike => !bike.sold);
      setBikes(availableBikes); setFilteredBikes(availableBikes);
    } catch (error) { setAlert({ show: true, message: 'Failed to load bikes', type: 'danger' }); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...bikes];
    if (token && userProfile) filtered = filtered.filter(bike => bike.owner !== userProfile._id);
    if (selectedBrand) filtered = filtered.filter(bike => bike.brand === selectedBrand);
    filtered = filtered.filter(bike => bike.price >= priceRange[0] && bike.price <= priceRange[1]);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bike =>
        bike.brand?.toLowerCase().includes(query) || bike.model?.toLowerCase().includes(query) ||
        bike.location?.toLowerCase().includes(query) || bike.description?.toLowerCase().includes(query)
      );
    }
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest': filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      default: break;
    }
    setFilteredBikes(filtered);
  };

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/cart`, { headers: { Authorization: `Bearer ${token}` } });
      setCartItems(response.data);
    } catch (error) { }
  };

  const handleAddToCart = async (bikeId) => {
    if (!token) { setAlert({ show: true, message: 'Please login to add items to cart', type: 'warning' }); return; }
    setCartLoading(prev => ({ ...prev, [bikeId]: true }));
    try {
      await axios.post(`${API_URL}/api/users/cart`, { bikeId }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchCartItems();
      setAlert({ show: true, message: 'Added to cart successfully!', type: 'success' });
    } catch { setAlert({ show: true, message: 'Failed to add to cart', type: 'danger' }); }
    finally { setCartLoading(prev => ({ ...prev, [bikeId]: false })); }
  };

  const handleRemoveFromCart = async (bikeId) => {
    setCartLoading(prev => ({ ...prev, [bikeId]: true }));
    try {
      await axios.delete(`${API_URL}/api/users/cart`, { headers: { Authorization: `Bearer ${token}` }, data: { bikeId } });
      await fetchCartItems();
      setAlert({ show: true, message: 'Removed from cart!', type: 'success' });
    } catch { setAlert({ show: true, message: 'Failed to remove from cart', type: 'danger' }); }
    finally { setCartLoading(prev => ({ ...prev, [bikeId]: false })); }
  };

  const handleBikeClick = (bike) => { setSelectedBike(bike); setCurrentImageIndex(0); setModalOpen(true); };

  const handleBookBike = async (bikeId) => {
    if (!token) { setAlert({ show: true, message: 'Please login to book bikes', type: 'warning' }); return; }
    setBookingLoading(prev => ({ ...prev, [bikeId]: true }));
    try {
      await axios.post(`${API_URL}/api/bikes/${bikeId}/book`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchBikes();
      setAlert({ show: true, message: 'Bike booked successfully!', type: 'success' });
    } catch (error) {
      setAlert({ show: true, message: error.response?.data?.message || 'Failed to book bike', type: 'danger' });
    } finally { setBookingLoading(prev => ({ ...prev, [bikeId]: false })); }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const handleDownloadPDF = async (bikeId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/bikes/${bikeId}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `bike_${bikeId}.pdf`;
    document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
  };

  const handleDownloadAllPDF = async () => {
    try {
      setAlert({ show: true, message: 'Generating catalogue, please wait...', type: 'info' });
      const response = await fetch(`${API_URL}/api/bikes/pdf/all`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'bikehouse_catalogue.pdf';
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      setAlert({ show: true, message: 'Catalogue downloaded!', type: 'success' });
    } catch { setAlert({ show: true, message: 'Failed to download catalogue', type: 'danger' }); }
  };

  return (
    <div className="bh-page" style={{ background: 'linear-gradient(180deg,#0d1117 0%,#0f1923 100%)', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 8 }}>
            🏍️ Bike Marketplace
          </h2>
          <p style={{ color: '#8b949e', fontSize: '1rem', margin: 0 }}>Find your perfect ride from thousands of bikes</p>
        </div>

        {/* Seller info banner */}
        {token && userProfile && (
          <div style={{
            background: 'linear-gradient(135deg,rgba(30,136,229,0.18) 0%,rgba(21,101,192,0.22) 100%)',
            border: '1px solid rgba(30,136,229,0.30)', borderRadius: 16,
            padding: '1.2rem 1.5rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h6 style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>🏪 Your Bikes Are Being Sold</h6>
              <p style={{ color: '#8b949e', margin: 0, fontSize: '0.88rem' }}>Your bikes are visible to potential buyers. Manage from your profile.</p>
            </div>
            <button onClick={() => navigate('/profile')} style={{
              background: 'rgba(30,136,229,0.25)', border: '1.5px solid rgba(30,136,229,0.55)',
              borderRadius: 50, color: '#64b5f6', fontWeight: 600, padding: '8px 20px',
              cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif',
            }}>Manage My Bikes →</button>
          </div>
        )}

        {/* Search + controls */}
        <div style={{ background: 'rgba(22,27,34,0.80)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '1.2rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '1rem' }}>🔍</span>
              <input
                type="text"
                style={{ ...inputS, paddingLeft: '2.4rem' }}
                placeholder="Search bikes by brand, model, location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)} style={{
              background: filterOpen ? 'rgba(247,147,30,0.18)' : 'rgba(255,255,255,0.07)',
              border: `1.5px solid ${filterOpen ? 'rgba(247,147,30,0.55)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 50, padding: '8px 20px', color: filterOpen ? '#f7931e' : '#e6edf3',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem',
            }}>⚙️ Filters</button>
            <button onClick={handleDownloadAllPDF} style={{
              background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
              border: 'none', borderRadius: 50, padding: '8px 20px',
              color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
              boxShadow: '0 4px 16px rgba(247,147,30,0.30)', fontFamily: 'Poppins, sans-serif',
            }}>📄 Download Catalogue</button>
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div style={{ background: 'rgba(22,27,34,0.90)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
              <div>
                <label style={labelSt}>Brand</label>
                <select style={selectS} value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Price Min (₹)</label>
                <input type="number" style={inputS} min="0" max="1000000" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} />
              </div>
              <div>
                <label style={labelSt}>Price Max (₹)</label>
                <input type="number" style={inputS} min="0" max="1000000" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} />
              </div>
              <div>
                <label style={labelSt}>Sort By</label>
                <select style={selectS} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.95rem' }}>
            <span style={{ color: '#f7931e', fontWeight: 800 }}>{filteredBikes.length}</span> bikes found
          </span>
          <span style={{
            background: 'rgba(30,136,229,0.18)', color: '#64b5f6',
            border: '1px solid rgba(30,136,229,0.30)',
            borderRadius: 20, padding: '3px 14px', fontSize: '0.82rem', fontWeight: 600,
          }}>{bikes.length} total</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner-border" style={{ width: 56, height: 56, color: '#f7931e', borderWidth: 3 }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Bikes grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.2rem' }}>
              {filteredBikes.map(bike => (
                <div key={bike._id} style={cardStyle}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)'; e.currentTarget.style.borderColor = 'rgba(247,147,30,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
                  onClick={() => handleBikeClick(bike)}>

                  {/* Image */}
                  <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                    <img
                      src={bike.images && bike.images[0] ? `${API_URL}${bike.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={bike.model}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: 'rgba(13,17,23,0.80)', backdropFilter: 'blur(8px)',
                      color: '#e6edf3', fontWeight: 600, borderRadius: 8,
                      padding: '2px 10px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.14)',
                    }}>{bike.brand}</div>
                    <div style={{
                      position: 'absolute', bottom: 10, right: 10,
                      background: 'linear-gradient(135deg,#f7931e,#ffd700)',
                      color: '#000', fontWeight: 800, borderRadius: 20,
                      padding: '3px 12px', fontSize: '0.85rem',
                    }}>{formatPrice(bike.price)}</div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h5 style={{ color: '#e6edf3', fontWeight: 700, marginBottom: 8, fontSize: '0.98rem' }}>{bike.brand} {bike.model}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', marginBottom: 10 }}>
                      {[['📍', bike.location], ['👥', `${bike.ownersCount} owners`], ['🛣️', `${bike.kilometresRun} km`], ['📅', bike.modelYear]].map(([icon, val], i) => (
                        <span key={i} style={{ color: '#8b949e', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {icon} <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                        </span>
                      ))}
                    </div>
                    {bike.description && (
                      <p style={{ color: '#6e7681', fontSize: '0.78rem', marginBottom: 12, lineHeight: 1.5 }}>
                        {bike.description.substring(0, 75)}{bike.description.length > 75 ? '...' : ''}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge badgeContent={bike.bookedBuyers?.length || 0} color="warning" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                          <BookmarkIcon style={{ color: '#8b949e' }} />
                        </Badge>
                        <button
                          style={{
                            flex: 1, background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
                            border: 'none', borderRadius: 50, color: '#000', fontWeight: 700,
                            padding: '7px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                          }}
                          onClick={e => { e.stopPropagation(); handleBookBike(bike._id); }}
                          disabled={bookingLoading[bike._id]}
                        >{bookingLoading[bike._id] ? 'Booking...' : '📋 Book'}</button>
                      </div>
                      {cartItems.some(item => item._id === bike._id) ? (
                        <button style={cartBtnDanger} onClick={e => { e.stopPropagation(); handleRemoveFromCart(bike._id); }} disabled={cartLoading[bike._id]}>
                          {cartLoading[bike._id] ? 'Removing...' : '🗑️ Remove from Cart'}
                        </button>
                      ) : (
                        <button style={cartBtnPrimary} onClick={e => { e.stopPropagation(); handleAddToCart(bike._id); }} disabled={cartLoading[bike._id]}>
                          {cartLoading[bike._id] ? 'Adding...' : '🛒 Add to Cart'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBikes.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#8b949e' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏍️</div>
                <h4 style={{ color: '#e6edf3', fontWeight: 700 }}>No bikes found</h4>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {modalOpen && selectedBike && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.80)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setModalOpen(false)}>
            <div style={{
              background: '#131c27', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, maxWidth: 900, width: '100%', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 32px 80px rgba(0,0,0,0.70)',
            }} onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#8b949e', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>{selectedBike.brand}</span>
                  <h4 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '1.3rem' }}>{selectedBike.model}</h4>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, width: 36, height: 36, color: '#e6edf3', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
                {/* Images */}
                <div>
                  <div style={{ borderRadius: 12, overflow: 'hidden', height: 280 }}>
                    <img
                      src={selectedBike.images && selectedBike.images[currentImageIndex] ? `${API_URL}${selectedBike.images[currentImageIndex]}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={selectedBike.model}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  {selectedBike.images && selectedBike.images.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      {selectedBike.images.map((img, i) => (
                        <img key={i} src={`${API_URL}${img}`} alt="" onClick={() => setCurrentImageIndex(i)}
                          style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                            border: `2px solid ${currentImageIndex === i ? '#f7931e' : 'rgba(255,255,255,0.15)'}`,
                            opacity: currentImageIndex === i ? 1 : 0.6, transition: 'all 0.2s' }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#f7931e,#ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {formatPrice(selectedBike.price)}
                    </span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h6 style={{ color: '#f7931e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Specifications</h6>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                      {[['Brand', selectedBike.brand], ['Model', selectedBike.model], ['Location', selectedBike.location], ['Owner', selectedBike.owner?.username || 'N/A'], ['Phone', selectedBike.owner?.phone || 'N/A'], ['No. of Owners', selectedBike.ownersCount], ['Kilometres Run', selectedBike.kilometresRun], ['Model Year', selectedBike.modelYear], ['Color', selectedBike.color]].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ color: '#6e7681', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{k}</div>
                          <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.88rem' }}>{v || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedBike.description && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h6 style={{ color: '#f7931e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Description</h6>
                      <p style={{ color: '#c9d1d9', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{selectedBike.description}</p>
                    </div>
                  )}
                  <div>
                    <h6 style={{ color: '#f7931e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Documents</h6>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={docBadge}>📝 RC: {selectedBike?.rc?.length > 0 ? `${selectedBike.rc.length} file(s)` : 'N/A'}</span>
                      <span style={docBadge}>🛡️ Insurance: {selectedBike?.insurance?.length > 0 ? `${selectedBike.insurance.length} file(s)` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.09)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, color: '#e6edf3', padding: '8px 20px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Close</button>
                <button onClick={() => handleDownloadPDF(selectedBike._id)} style={{ background: 'rgba(30,136,229,0.20)', border: '1.5px solid rgba(30,136,229,0.45)', borderRadius: 50, color: '#64b5f6', padding: '8px 20px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>📄 Download PDF</button>
                {cartItems.some(item => item._id === selectedBike?._id) ? (
                  <button style={{ ...cartBtnDanger, borderRadius: 50, padding: '8px 20px' }} onClick={() => { handleRemoveFromCart(selectedBike._id); setModalOpen(false); }}>Remove from Cart</button>
                ) : (
                  <button style={{ background: 'linear-gradient(135deg,#f7931e,#ffd700)', border: 'none', borderRadius: 50, color: '#000', fontWeight: 700, padding: '8px 20px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }} onClick={() => { handleAddToCart(selectedBike._id); setModalOpen(false); }}>Add to Cart</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alert toast */}
        {alert.show && (
          <div style={{
            position: 'fixed', bottom: 90, right: 24, zIndex: 10000,
            background: alert.type === 'success' ? 'rgba(34,197,94,0.15)' : alert.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(30,136,229,0.15)',
            border: `1px solid ${alert.type === 'success' ? 'rgba(34,197,94,0.45)' : alert.type === 'danger' ? 'rgba(239,68,68,0.45)' : 'rgba(30,136,229,0.45)'}`,
            backdropFilter: 'blur(12px)', borderRadius: 12,
            padding: '0.75rem 1.2rem', minWidth: 260,
            color: alert.type === 'success' ? '#22c55e' : alert.type === 'danger' ? '#ef4444' : '#64b5f6',
            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
          }}>
            <span>{alert.message}</span>
            <button onClick={() => setAlert({ ...alert, show: false })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Floating cart */}
        <button
          onClick={() => navigate('/cart')}
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 60, height: 60,
            background: 'linear-gradient(135deg,#f7931e,#ffd700)',
            border: 'none', borderRadius: '50%', color: '#000', fontSize: '1.5rem',
            cursor: 'pointer', zIndex: 1000, boxShadow: '0 8px 28px rgba(247,147,30,0.50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: cartItems.length > 0 ? 'pulseGlow 2s infinite' : 'none',
          }}
        >
          🛒
          {cartItems.length > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.7rem',
              borderRadius: '50%', width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #0d1117',
            }}>{cartItems.length}</span>
          )}
        </button>
      </div>
    </div>
  );
}

const labelSt = {
  display: 'block', color: '#8b949e', fontSize: '0.75rem',
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
};

const cartBtnPrimary = {
  background: 'rgba(30,136,229,0.20)', border: '1.5px solid rgba(30,136,229,0.45)',
  borderRadius: 50, color: '#64b5f6', fontWeight: 700, padding: '7px',
  cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Poppins, sans-serif', width: '100%',
};

const cartBtnDanger = {
  background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.40)',
  borderRadius: 50, color: '#ef4444', fontWeight: 700, padding: '7px',
  cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Poppins, sans-serif', width: '100%',
};

const docBadge = {
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, padding: '4px 10px', color: '#8b949e', fontSize: '0.78rem', fontWeight: 500,
};

export default BikeMarketplace;