import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn, getUser, logout } from '../utils/auth';
import '../styles/homepage.css';

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [user, setUser] = useState(getUser());

  const goLogin = () => navigate('/auth');
  const goProfile = () => navigate('/profile');
  const doLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    if (location.pathname !== '/') navigate('/');
  };

  useEffect(() => {
    // Update auth state when route changes
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, [location.pathname]);

  useEffect(() => {
    // Listen to storage changes (e.g., other tabs)
    const onStorage = () => {
      setLoggedIn(isLoggedIn());
      setUser(getUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <header className="main-header" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="header-glass" style={{ borderRadius: 12 }}>
        <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => navigate('/') }>
          <div className="logo-icon" style={{ animation: 'none' }}>🚗</div>
          <span className="logo-text">TrafficExam</span>
        </div>
        {!loggedIn ? (
          <button className="header-cta" onClick={goLogin}>Đăng nhập</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="header-cta" onClick={goProfile}>👤 {user?.fullName || 'Hồ sơ'}</button>
            <button className="header-cta" onClick={doLogout}>⎋ Đăng xuất</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;

