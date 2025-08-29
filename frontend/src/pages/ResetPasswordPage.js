import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import '../styles/AuthPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
    } else {
      setError('Token đặt lại mật khẩu không hợp lệ');
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.');
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setError(data.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div className="auth-container">
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
          <div className="auth-wrapper">
            <div className="auth-card">
              <div className="error-message">
                Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </div>
              <button 
                onClick={() => navigate('/auth')}
                className="submit-button"
              >
                Quay lại trang đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
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
        <div className="auth-header">
          <button 
            onClick={() => navigate('/auth')}
            className="back-button"
          >
            ← Quay lại trang đăng nhập
          </button>
        </div>

        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header-content">
              <h1 className="auth-title">Đặt lại mật khẩu</h1>
              <p className="auth-subtitle">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              <div className="form-group">
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    minLength={6}
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

              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
              </button>
            </form>

            <div className="switch-mode">
              <span>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="switch-link"
                >
                  Quay lại đăng nhập
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

