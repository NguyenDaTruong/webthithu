import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp && formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }

      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        alert(`${isSignUp ? 'Đăng ký' : 'Đăng nhập'} thành công!`);
        navigate('/'); // Redirect to homepage
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background */}
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

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Header */}
        <div className="auth-header">
          <button 
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Quay lại trang chủ
          </button>
        </div>

        {/* Auth Container */}
        <div className="auth-wrapper">
          <div className="auth-card">
            {/* Header */}
            <div className="auth-header-content">
              <h1 className="auth-title">
                {isSignUp ? 'Tạo tài khoản mới' : 'Đăng nhập'}
              </h1>
              <p className="auth-subtitle">
                {isSignUp 
                  ? 'Tham gia cùng chúng tôi để bắt đầu hành trình học tập' 
                  : 'Chào mừng bạn quay trở lại!'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div className="form-group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Họ và tên"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required={isSignUp}
                  />
                </div>
              )}

              {!isSignUp && (
                <div className="forgot-password">
                  <button type="button" className="forgot-link">
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    {isSignUp ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...'}
                  </div>
                ) : (
                  isSignUp ? 'Đăng ký' : 'Đăng nhập'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>hoặc</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button className="social-button google">
                <span>Google</span>
              </button>
              <button className="social-button facebook">
                <span>Facebook</span>
              </button>
            </div>

            {/* Switch Mode */}
            <div className="switch-mode">
              <span>
                {isSignUp ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="switch-link"
                >
                  {isSignUp ? "Đăng nhập" : "Đăng ký"}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
