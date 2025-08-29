import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn, getUser, logout } from '../utils/auth';
import '../styles/homepage.css';

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [user, setUser] = useState(getUser());
  const [showLeavePopup, setShowLeavePopup] = useState(false);

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

  const isExamRoute = location.pathname === '/exam' || location.pathname === '/quiz';

  const handleLogoClick = () => {
    if (isExamRoute) {
      setShowLeavePopup(true);
    } else {
      navigate('/');
    }
  };
  const confirmLeave = () => {
    setShowLeavePopup(false);
    navigate('/');
  };
  const cancelLeave = () => setShowLeavePopup(false);

  return (
    <header className="main-header" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="header-glass" style={{ borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div className="logo-section" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
          <div className="logo-icon" style={{ animation: 'none' }}>🚗</div>
          <span className="logo-text">TrafficExam</span>
        </div>
        {isExamRoute && (
          <div onClick={() => setShowLeavePopup(true)} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, color: '#cfcfe1', fontWeight: 600, cursor: 'pointer' }}>
            <span role="img" aria-label="traffic-light">🚦</span>
            <span>{location.pathname === '/exam' ? 'Thi chứng nhận an toàn giao thông' : 'Thi thử an toàn giao thông'}</span>
          </div>
        )}
        {!loggedIn ? (
          <button className="header-cta" onClick={goLogin}>Đăng nhập</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="header-cta" onClick={goProfile}>👤 {user?.fullName || 'Hồ sơ'}</button>
            <button className="header-cta" onClick={doLogout}>⎋ Đăng xuất</button>
          </div>
        )}
      </div>
      {showLeavePopup && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>Xác nhận</h3>
              <p>Bạn có chắc chắn muốn về trang chủ? Tất cả tiến độ làm bài sẽ bị mất.</p>
              <div className="home-popup-buttons">
                <button onClick={confirmLeave} className="home-popup-btn confirm">Có, về trang chủ</button>
                <button onClick={cancelLeave} className="home-popup-btn cancel">Không, tiếp tục làm bài</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;

