import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import "../styles/homepage.css";
import { isLoggedIn, fetchProfile, isProfileComplete } from '../utils/auth';

const HomePage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const [authPopup, setAuthPopup] = useState({ visible: false, title: '', message: '' });

  const handleFeatureClick = async (feature) => {
    if (feature.id !== 'exam') {
      navigate(feature.path);
      return;
    }
    // Kiểm tra điều kiện trước khi đi tới thi thật
    if (!isLoggedIn()) {
      setAuthPopup({
        visible: true,
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để làm bài thi thật. Chuyển đến trang đăng nhập/đăng ký?'
      });
      return;
    }
    const profile = await fetchProfile();
    if (!isProfileComplete(profile)) {
      setAuthPopup({
        visible: true,
        title: 'Hoàn thiện hồ sơ',
        message: 'Vui lòng hoàn thiện hồ sơ (Họ tên, SĐT, Ngày sinh, Giới tính, Địa chỉ, CMND/CCCD, Ảnh đại diện) trước khi thi.'
      });
      return;
    }
    navigate('/exam');
  };

  const features = [
    {
      id: 'exam',
      title: 'Thi thật',
      subtitle: 'Làm bài thi chính thức',
      description: 'Thi lấy chứng chỉ giao thông với đề thi thật từ ngân hàng câu hỏi chính thức',
      icon: '🏆',
      gradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(255, 142, 83, 0.9) 100%)',
      path: '/exam',
      stats: 'Có thể nhận chứng chỉ'
    },
    {
      id: 'quiz',
      title: 'Thi thử',
      subtitle: 'Luyện tập không giới hạn',
      description: 'Ôn luyện với hàng ngàn câu hỏi đa dạng, có giải thích chi tiết',
      icon: '📚',
      gradient: 'linear-gradient(135deg, rgba(84, 160, 255, 0.9) 0%, rgba(117, 127, 251, 0.9) 100%)',
      path: '/quiz',
      stats: 'Sửa sai ngay trong lúc làm bài'
    },
    {
      id: 'certificate',
      title: 'Chứng chỉ',
      subtitle: 'Tra cứu & quản lý',
      description: 'Tra cứu thông tin chứng chỉ',
      icon: '📋',
      gradient: 'linear-gradient(135deg, rgba(96, 209, 148, 0.9) 0%, rgba(34, 193, 195, 0.9) 100%)',
      path: '/certificate',
      stats: 'Tra cứu nhanh'
    }
  ];

  const quickStats = [
    // { label: 'Người dùng', value: '12,500+' },
    // { label: 'Câu hỏi', value: '2,500+' },
    // { label: 'Tỷ lệ đậu', value: '85%' },
    // { label: 'Chứng chỉ', value: '8,200+' }
  ];

  return (
    <div className="homepage-container">
      <div className="background-container">
        <DarkVeil
          speed={0.5}
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>

      <div className="content-wrapper">
        {/* Header đã chuyển thành component dùng chung (SiteHeader) */}

        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Ngân hàng câu hỏi</span>
              <span className="title-line gradient-text">Giao thông Việt Nam</span>
            </h1>
            <p className="hero-description">
              Nền tảng học tập và thi thử chứng chỉ giao thông trực tuyến hàng đầu.
              Bộ đề thi GPLX với 600 câu hỏi được cập nhật liên tục theo luật giao thông mới 2025.
            </p>
            <div className="quick-stats">
              {quickStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-header">
            <h2 className="section-title">Chọn chức năng</h2>
            <p className="section-subtitle">Bắt đầu hành trình của bạn ngay hôm nay</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`feature-card ${hoveredCard === feature.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleFeatureClick(feature)}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className="card-background" style={{ background: feature.gradient }}></div>
                <div className="card-glass"></div>
                <div className="card-content">
                  <div className="card-icon">{feature.icon}</div>
                  <div className="card-info">
                    <h3 className="card-title">{feature.title}</h3>
                    <p className="card-subtitle">{feature.subtitle}</p>
                    <p className="card-description">{feature.description}</p>
                  </div>
                  <div className="card-stats">{feature.stats}</div>
                  <div className="card-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <div className="info-glass">
            <div className="info-content">
              <h3>Tại sao chọn chúng tôi?</h3>
              <div className="info-features">
                <div className="info-item">
                  <span className="info-icon">✅</span>
                  <span>Câu hỏi chính thức từ Bộ Giao thông Vận tải</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⚡</span>
                  <span>Cập nhật liên tục theo quy định mới nhất</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📱</span>
                  <span>Hỗ trợ đa nền tảng: Web, Mobile, Tablet</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🎯</span>
                  <span>Giải thích chi tiết cho từng câu hỏi</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Popup yêu cầu đăng nhập/hoàn thiện hồ sơ hiển thị ngay trên homepage */}
        {authPopup.visible && (
          <div className="home-popup-overlay">
            <div className="home-popup">
              <div className="home-popup-content">
                <h3>{authPopup.title}</h3>
                <p>{authPopup.message}</p>
                <div className="home-popup-buttons">
                  <button onClick={() => setAuthPopup({ visible: false, title: '', message: '' })} className="home-popup-btn cancel">
                    Quay lại
                  </button>
                  <button
                    onClick={() =>
                      authPopup.title === 'Hoàn thiện hồ sơ' ? navigate('/profile') : navigate('/auth')
                    }
                    className="home-popup-btn confirm"
                  >
                    {authPopup.title === 'Hoàn thiện hồ sơ' ? 'Đến trang hồ sơ' : 'Đến trang đăng nhập'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;