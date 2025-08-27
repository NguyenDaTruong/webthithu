import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficialExam from '../components/OfficialExam';
import { isLoggedIn, fetchProfile, isProfileComplete } from '../utils/auth';

const ExamPage = () => {
  const navigate = useNavigate();
  const [allow, setAllow] = useState(false);
  const [checking, setChecking] = useState(true);
  const [popup, setPopup] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    const verify = async () => {
      if (!isLoggedIn()) {
        setPopup({
          visible: true,
          title: 'Yêu cầu đăng nhập',
          message: 'Bạn cần đăng nhập để làm bài thi thật. Chuyển đến trang đăng nhập/đăng ký?'
        });
        return;
      }
      const profile = await fetchProfile();
      if (!isProfileComplete(profile)) {
        setPopup({
          visible: true,
          title: 'Hoàn thiện hồ sơ',
          message: 'Vui lòng hoàn thiện hồ sơ (Họ tên, SĐT, Ngày sinh, Giới tính, Địa chỉ, CMND/CCCD, Ảnh đại diện) trước khi thi.'
        });
        return;
      }
      setAllow(true);
    };
    verify().finally(() => setChecking(false));
  }, [navigate]);

  const goAuth = () => navigate('/auth');
  const goProfile = () => navigate('/profile');
  const goHome = () => navigate('/');

  if (checking) return null;
  if (!allow) {
    return (
      <div className="home-popup-overlay">
        <div className="home-popup">
          <div className="home-popup-content">
            <h3>{popup.title || 'Thông báo'}</h3>
            <p>{popup.message}</p>
            <div className="home-popup-buttons">
              <button onClick={goHome} className="home-popup-btn cancel">Quay lại</button>
              <button
                onClick={popup.title === 'Hoàn thiện hồ sơ' ? goProfile : goAuth}
                className="home-popup-btn confirm"
              >
                {popup.title === 'Hoàn thiện hồ sơ' ? 'Đến trang hồ sơ' : 'Đến trang đăng nhập'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <OfficialExam />;
};

export default ExamPage;