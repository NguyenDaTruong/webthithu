import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    idCard: '',
    dateOfBirth: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isForgotPassword) {
        if (isVerified) {
          // Handle password reset after verification
          if (formData.newPassword !== formData.confirmNewPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
          }

          if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
          }

          const response = await fetch('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              resetToken: verifiedUser.resetToken,
              newPassword: formData.newPassword
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
            // Reset form và chuyển về đăng nhập
            setTimeout(() => {
              setIsForgotPassword(false);
              setIsVerified(false);
              setVerifiedUser(null);
              setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                fullName: '',
                phone: '',
                idCard: '',
                dateOfBirth: '',
                newPassword: '',
                confirmNewPassword: ''
              });
            }, 3000);
          } else {
            setError(data.message || 'Đặt lại mật khẩu thất bại');
          }
          return;
        }

        // Handle forgot password verification
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            idCard: formData.idCard,
            dateOfBirth: formData.dateOfBirth
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.message);
          setIsVerified(true);
          setVerifiedUser({ ...data.user, resetToken: data.resetToken });
        } else {
          setError(data.message || 'Có lỗi xảy ra khi xác thực thông tin');
        }
        return;
      }

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
        navigate('/');
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

  const resetForgotPassword = () => {
    setIsForgotPassword(false);
    setIsVerified(false);
    setVerifiedUser(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      idCard: '',
      dateOfBirth: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setError('');
    setSuccess('');
  };

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
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Quay lại trang chủ
          </button>
        </div>

        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header-content">
              <h1 className="auth-title">
                {isForgotPassword 
                  ? (isVerified ? 'Đặt lại mật khẩu' : 'Quên mật khẩu')
                  : (isSignUp ? 'Tạo tài khoản mới' : 'Đăng nhập')
                }
              </h1>
              <p className="auth-subtitle">
                {isForgotPassword 
                  ? (isVerified 
                    ? 'Nhập mật khẩu mới cho tài khoản của bạn' 
                    : 'Nhập thông tin cá nhân để xác thực và đặt lại mật khẩu'
                  )
                  : (isSignUp 
                    ? 'Tham gia cùng chúng tôi để bắt đầu hành trình học tập' 
                    : 'Chào mừng bạn quay trở lại!'
                  )
                }
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

              {/* Email field - luôn hiển thị */}
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

              {/* Các trường cho quên mật khẩu - chỉ hiển thị khi chưa xác thực */}
              {isForgotPassword && !isVerified && (
                <>
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="idCard"
                      placeholder="CCCD/CMND"
                      value={formData.idCard}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="date"
                      name="dateOfBirth"
                      placeholder="Ngày sinh"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}

              {/* Form đổi mật khẩu sau khi xác thực thành công */}
              {isForgotPassword && isVerified && (
                <>
                  <div className="verified-user-info">
                    <p className="verified-message">
                      ✅ Xác thực thành công cho tài khoản: <strong>{verifiedUser?.email}</strong>
                    </p>
                  </div>
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
                      name="confirmNewPassword"
                      placeholder="Xác nhận mật khẩu mới"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}

              {/* Các trường cho đăng ký */}
              {!isForgotPassword && isSignUp && (
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

              {/* Các trường cho đăng nhập và đăng ký */}
              {!isForgotPassword && (
                <>
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
                </>
              )}

              {/* Link quên mật khẩu chỉ hiển thị khi đăng nhập */}
              {!isForgotPassword && !isSignUp && (
                <div className="forgot-password">
                  <button type="button" className="forgot-link" onClick={() => setIsForgotPassword(true)}>
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading 
                  ? (isForgotPassword 
                    ? (isVerified ? 'Đang đặt lại mật khẩu...' : 'Đang xác thực...')
                    : (isSignUp ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...')
                  )
                  : (isForgotPassword 
                    ? (isVerified ? 'Đặt lại mật khẩu' : 'Xác thực thông tin')
                    : (isSignUp ? 'Đăng ký' : 'Đăng nhập')
                  )
                }
              </button>
            </form>

            {/* Divider và Social Login chỉ hiển thị khi không phải quên mật khẩu */}
            {!isForgotPassword && (
              <>
                <div className="divider">
                  <span>hoặc</span>
                </div>

                <div className="social-login">
                  <button className="social-button google">
                    <span>Google</span>
                  </button>
                  <button className="social-button facebook">
                    <span>Facebook</span>
                  </button>
                </div>
              </>
            )}

            {/* Switch Mode */}
            <div className="switch-mode">
              {isForgotPassword ? (
                <span>
                  <button
                    type="button"
                    onClick={resetForgotPassword}
                    className="switch-link"
                  >
                    Quay lại đăng nhập
                  </button>
                </span>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
