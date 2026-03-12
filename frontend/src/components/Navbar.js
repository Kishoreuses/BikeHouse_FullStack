import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api/api';

function Navbar() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (token && isMounted) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (isMounted) setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    fetchUserProfile();

    const handleProfileUpdate = (event) => {
      if (isMounted) {
        if (event.detail && event.detail.profileData) {
          setUserProfile(event.detail.profileData);
        } else {
          fetchUserProfile();
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [token]);

  const handleLogout = () => {
    try {
      setUserProfile(null);
      setLoading(false);
      localStorage.removeItem('token');
      setTimeout(() => { window.location.href = '/login'; }, 0);
    } catch (error) {
      window.location.href = '/login';
    }
  };

  let profileName = '';
  let originalUsername = '';
  const isAdmin = user && user.role === 'admin';

  if (userProfile) {
    profileName = isAdmin
      ? 'Admin'
      : userProfile.firstName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile.username || '';
    originalUsername = userProfile.username || '';
  } else if (user) {
    profileName = isAdmin ? 'Admin' : user.username || '';
    originalUsername = user.username || '';
  }

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: 'rgba(13, 17, 23, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.40)',
        fontFamily: 'Poppins, sans-serif',
        zIndex: 1050,
        minHeight: 68,
      }}
    >
      <div className="container-fluid px-4">

        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
          to={isAdmin ? '/admin' : '/'}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 9,
            border: '2px solid rgba(247,147,30,0.65)',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 0 14px rgba(247,147,30,0.25)',
          }}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
              alt="BikeHouse"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span style={{
            fontWeight: 900, fontSize: '1.25rem', letterSpacing: 1.5,
            background: 'linear-gradient(135deg, #ffffff 40%, #f7931e 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            BIKEHOUSE
          </span>
        </Link>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ color: '#f7931e' }}
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        {/* Collapsible */}
        <div className="collapse navbar-collapse" id="mainNavbar">

          {/* Nav Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAdmin ? (
              <>
                <NavItem to="/admin" label="Dashboard" />
                <NavItem to="/sales" label="Sales" />
                <NavItem to="/users" label="User Details" />
                <NavItem to="/about" label="About" />
              </>
            ) : (
              <>
                <NavItem to="/" label="Home" />
                <NavItem to="/marketplace" label="Buy Bikes" />
                <NavItem to="/sale" label="Sell Bike" />
                <NavItem to="/cart" label="Cart" />
                <NavItem to="/about" label="About" />
              </>
            )}
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Avatar */}
                <div
                  onClick={() => navigate('/profile')}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
                    border: '2px solid rgba(247,147,30,0.70)',
                    overflow: 'hidden', flexShrink: 0,
                    boxShadow: '0 0 10px rgba(247,147,30,0.28)',
                    position: 'relative',
                  }}
                  key={userProfile?.profileImage || 'avatar'}
                >
                  {userProfile && userProfile.profileImage ? (
                    <img
                      src={`${API_URL}${userProfile.profileImage.startsWith('/') ? '' : '/'}${userProfile.profileImage}?t=${Date.now()}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: userProfile?.profileImage ? 'none' : 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg,#1e3a5f,#0f2027)',
                    color: '#f7931e', fontSize: 16, fontWeight: 700,
                  }}>
                    {(profileName && profileName.charAt(0).toUpperCase()) || 'U'}
                  </div>
                </div>

                {/* Name */}
                <div className="d-none d-lg-flex flex-column" style={{ lineHeight: 1.2 }}>
                  {loading ? (
                    <span style={{ color: '#8b949e', fontSize: 13 }}>Loading...</span>
                  ) : (
                    <>
                      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 14 }}>
                        {profileName || 'User'}
                      </span>
                      {originalUsername && originalUsername !== profileName && (
                        <span style={{ color: '#8b949e', fontSize: 11 }}>@{originalUsername}</span>
                      )}
                    </>
                  )}
                </div>

                {/* Logout button */}
                <button
                  className="btn btn-sm"
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid rgba(247,147,30,0.55)',
                    color: '#f7931e', fontWeight: 700, borderRadius: 50,
                    padding: '5px 16px', fontSize: 13,
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(247,147,30,0.14)'; e.target.style.borderColor = '#f7931e'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(247,147,30,0.55)'; }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-sm"
                  style={{
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    color: 'rgba(255,255,255,0.85)', fontWeight: 600,
                    borderRadius: 50, padding: '5px 18px', fontSize: 13,
                    fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg,#f7931e 0%,#ffd700 100%)',
                    border: 'none', color: '#000', fontWeight: 700,
                    borderRadius: 50, padding: '5px 18px', fontSize: 13,
                    boxShadow: '0 4px 14px rgba(247,147,30,0.35)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

function NavItem({ to, label }) {
  const current = window.location.pathname === to;
  return (
    <li className="nav-item">
      <Link
        to={to}
        className="nav-link fw-bold px-3"
        style={{
          color: current ? '#f7931e' : 'rgba(255,255,255,0.80)',
          borderBottom: current ? '2px solid #f7931e' : '2px solid transparent',
          paddingBottom: '4px',
          transition: 'all 0.2s ease',
          fontSize: 14,
        }}
        onMouseEnter={e => { if (!current) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderBottomColor = 'rgba(247,147,30,0.40)'; } }}
        onMouseLeave={e => { if (!current) { e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
      >
        {label}
      </Link>
    </li>
  );
}

export default Navbar;