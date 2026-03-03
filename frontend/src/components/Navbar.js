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
          if (isMounted) {
            console.log('User profile data received:', response.data);
            setUserProfile(response.data);

            // Test image accessibility if profile image exists
            if (response.data.profileImage) {
              testImageUrl(response.data.profileImage).then(isAccessible => {
                console.log('Profile image accessible:', isAccessible);
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchUserProfile();

    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      console.log('Profile update event received in navbar');
      if (isMounted) {
        if (event.detail && event.detail.profileData) {
          console.log('Updating navbar with new profile data:', event.detail.profileData);
          setUserProfile(event.detail.profileData);
        } else {
          console.log('Fetching profile data from server');
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
      // Clear all state first
      setUserProfile(null);
      setLoading(false);

      // Remove token
      localStorage.removeItem('token');

      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 0);
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to simple redirect
      window.location.href = '/login';
    }
  };

  // Test function to check image accessibility
  const testImageUrl = async (imagePath) => {
    if (!imagePath) return false;
    try {
      const response = await fetch(`${API_URL}${imagePath}`);
      return response.ok;
    } catch (error) {
      console.error('Image test failed:', error);
      return false;
    }
  };

  let profileName = '';
  let originalUsername = '';
  const isAdmin = user && user.role === 'admin';

  if (userProfile) {
    profileName = isAdmin ? 'Admin' : userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.username || '';
    originalUsername = userProfile.username || '';
  } else if (user) {
    profileName = isAdmin ? 'Admin' : user.username || '';
    originalUsername = user.username || '';
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-lg animate__animated animate__fadeInDown"
      style={{
        fontFamily: 'Poppins, Roboto, Arial, sans-serif',
        minHeight: 70,
        borderBottom: '2px solid #1565c0',
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand d-flex align-items-center fw-bold fs-4 fs-md-2"
          to={isAdmin ? "/admin" : "/"}
          style={{
            fontFamily: 'Poppins, Roboto, Arial, sans-serif',
            letterSpacing: 1,
            color: '#fff',
            fontWeight: 900,
            textShadow: '1px 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
            alt="BikeHouse Logo"
            className="navbar-logo-img"
            style={{ width: 'clamp(40px, 8vw, 60px)', height: 'auto', marginRight: 10, borderRadius: 8 }}
          />
          <span className="d-none d-sm-inline">BIKEHOUSE</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
            {isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/admin">
                    <span className="fw-bold">Dashboard</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/sales">
                    <span className="fw-bold">Sales</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/users">
                    <span className="fw-bold">User Details</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/about">
                    <span className="fw-bold">About</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/">
                    <span className="fw-bold">Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/marketplace">
                    <span className="fw-bold">Buy Bikes</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/sale">
                    <span className="fw-bold">Sell Bike</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/cart">
                    <span className="fw-bold">Cart</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/about">
                    <span className="fw-bold">About</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-white text-primary fw-bold d-flex justify-content-center align-items-center shadow-sm overflow-hidden"
                    style={{
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      fontSize: 18,
                      border: '2px solid #fff',
                      fontFamily: 'Poppins, Roboto, Arial, sans-serif',
                      position: 'relative'
                    }}
                    onClick={() => navigate('/profile')}
                    key={userProfile?.profileImage || 'no-image'}
                  >
                    {userProfile && userProfile.profileImage ? (
                      <>
                        {console.log('Rendering profile image:', userProfile.profileImage)}
                        {console.log('Full image URL:', `http://localhost:5000${userProfile.profileImage}`)}
                        <img
                          src={`${API_URL}${userProfile.profileImage}?t=${Date.now()}`}
                          alt="Profile"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            console.log('Profile image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            console.log('Profile image loaded successfully:', e.target.src);
                          }}
                        />
                      </>
                    ) : (
                      console.log('No profile image available, showing initials')
                    )}
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: userProfile && userProfile.profileImage ? 'none' : 'flex',
                        backgroundColor: '#fff',
                        color: '#1976d2',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}
                    >
                      {(profileName && profileName.charAt(0).toUpperCase()) || 'U'}
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-start justify-content-center d-none d-md-flex" style={{ minWidth: 90 }}>
                    {loading ? (
                      <span className="fw-bold text-white fs-6" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
                        Loading...
                      </span>
                    ) : (
                      <>
                        <span className="fw-bold text-white fs-6" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
                          {profileName || 'User'}
                        </span>
                        {originalUsername && originalUsername !== profileName && (
                          <span className="text-white-50 small" style={{ fontSize: 12, marginTop: -4 }}>
                            @{originalUsername}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button className="btn btn-outline-light btn-sm px-3 ms-md-2" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }} onClick={handleLogout}>
                    <span className="mb-0 fw-bold">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm px-3 me-2" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }} to="/login">
                  <span className="mb-0 fw-bold">Login</span>
                </Link>
                <Link className="btn btn-warning btn-sm px-3" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }} to="/signup">
                  <span className="mb-0 fw-bold">Signup</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .nav-link-custom {
          color: #fff !important;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-link-custom:hover, .nav-link-custom.active {
          background: #1565c0 !important;
          color: #fff !important;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;