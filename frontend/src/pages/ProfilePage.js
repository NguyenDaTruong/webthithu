import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import { isLoggedIn, fetchProfile, uploadAvatar, API_BASE } from '../utils/auth';
import '../styles/ProfilePage.css';

const initialUser = {
  username: '',
  email: '',
  role: 'user',
  fullName: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  idCard: '',
  hasLicense: false,
  licenseScore: 0,
  licenseClass: '',
  licenseDate: '',
  profileImage: ''
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile'); // profile | password | certificates
  const [form, setForm] = useState({
    username: initialUser.username,
    email: initialUser.email,
    role: initialUser.role,
    fullName: initialUser.fullName,
    phone: initialUser.phone,
    dateOfBirth: initialUser.dateOfBirth,
    gender: initialUser.gender,
    idCard: initialUser.idCard,
    address: initialUser.address,
    licenseClass: initialUser.licenseClass,
    licenseDate: initialUser.licenseDate,
    licenseScore: initialUser.licenseScore,
  });
  const [hasLicense, setHasLicense] = useState(Boolean(initialUser.hasLicense));
  const [avatarSrc, setAvatarSrc] = useState(initialUser.profileImage || '');
  const [editing, setEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileRef = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const selectGender = (gender) => {
    setForm((s) => ({ ...s, gender }));
  };

  const updateScore = (e) => {
    const value = e.target.value || 0;
    setForm((s) => ({ ...s, licenseScore: Number(value) }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Tạm thời chỉ thông báo thành công
    alert('✅ Cập nhật thông tin thành công!');
  };

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!isLoggedIn()) {
      navigate('/auth');
      return;
    }
    // Load profile from API
    const load = async () => {
      const profile = await fetchProfile();
      if (!profile) {
        navigate('/auth');
        return;
      }
      setForm({
        username: profile.username || '',
        email: profile.email || '',
        role: profile.role || 'user',
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
        gender: profile.gender || '',
        idCard: profile.idCard || '',
        address: profile.address || '',
        licenseClass: profile.licenseClass || '',
        licenseDate: profile.licenseDate ? String(profile.licenseDate).slice(0, 10) : '',
        licenseScore: Number(profile.licenseScore || 0)
      });
      setHasLicense(Boolean(profile.hasLicense));
      if (profile.profileImage) {
        const full = profile.profileImage.startsWith('http') ? profile.profileImage : `${API_BASE}${profile.profileImage}`;
        setAvatarSrc(full);
      } else {
        setAvatarSrc('');
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="profile-container">
      <div className="profile-background">
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

      <div className="profile-wrapper">
        <div className="profile-layout glass">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className={`sidebar-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
              <span>Hồ sơ</span>
            </div>
            <div className={`sidebar-item ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
              <span>Mật khẩu</span>
            </div>
            <div className={`sidebar-item ${tab === 'cert' ? 'active' : ''}`} onClick={() => setTab('cert')}>
              <span>Chứng chỉ</span>
            </div>
          </aside>

          {/* Content */}
          <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar" onClick={() => setShowAvatarModal(true)}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" />
              ) : (
                <span>👤</span>
              )}
              <div className="avatar-upload" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}></div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    // Preview local first
                    const reader = new FileReader();
                    reader.onload = (ev) => setAvatarSrc(String(ev.target?.result || ''));
                    reader.readAsDataURL(file);
                    // Upload to server
                    (async () => {
                      const url = await uploadAvatar(file);
                      if (url) {
                        const full = url.startsWith('http') ? url : `${API_BASE}${url}`;
                        setAvatarSrc(full);
                      }
                    })();
                  }
                }}
              />
            </div>
            {showAvatarModal && (
              <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
                <div className="avatar-modal" onClick={(e)=>e.stopPropagation()}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar-large" />
                  ) : (
                    <div style={{color:'#cfcfe1'}}>Chưa có ảnh đại diện</div>
                  )}
                  <button className="avatar-modal-close" onClick={() => setShowAvatarModal(false)}>✕</button>
                </div>
              </div>
            )}
            <h1>Hồ Sơ Cá Nhân</h1>
            <div className={`status-badge ${true ? 'status-active' : 'status-inactive'}`}>Đang hoạt động</div>
          </div>

          {/* Tab: Hồ sơ */}
          {tab === 'profile' && (
            <div className="form-container">
              {/* Summary mode */}
              {!editing && (
                <div className="profile-summary">
                  <div className="summary-grid">
                    <div className="summary-item"><span className="label">Họ và tên</span><span className="value">{form.fullName || '-'}</span></div>
                    <div className="summary-item"><span className="label">Email</span><span className="value">{form.email || '-'}</span></div>
                    <div className="summary-item"><span className="label">Số điện thoại</span><span className="value">{form.phone || '-'}</span></div>
                    <div className="summary-item"><span className="label">Giới tính</span><span className="value">{form.gender || '-'}</span></div>
                    <div className="summary-item"><span className="label">Ngày sinh</span><span className="value">{form.dateOfBirth || '-'}</span></div>
                    <div className="summary-item"><span className="label">CCCD/CMND</span><span className="value">{form.idCard || '-'}</span></div>
                    <div className="summary-item full"><span className="label">Địa chỉ</span><span className="value">{form.address || '-'}</span></div>
                  </div>
                  <div className="btn-container" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>
                  </div>
                </div>
              )}

              {/* Edit mode */}
              {editing && (
                <form onSubmit={(e)=>{onSubmit(e); setEditing(false);}}>
                  <div className="form-section">
                    <h2 className="section-title">Thông Tin Tài Khoản</h2>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Tên đăng nhập <span className="required">*</span></label>
                        <input name="username" value={form.username} onChange={onChange} required />
                      </div>
                      <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input type="email" name="email" value={form.email} onChange={onChange} required />
                      </div>
                      <div className="form-group">
                        <label>Vai trò</label>
                        <select name="role" value={form.role} onChange={onChange}>
                          <option value="admin">Quản trị viên</option>
                          <option value="user">Người dùng</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h2 className="section-title">Thông Tin Cá Nhân</h2>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Họ và tên <span className="required">*</span></label>
                        <input name="fullName" value={form.fullName} onChange={onChange} required />
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại <span className="required">*</span></label>
                        <input name="phone" value={form.phone} onChange={onChange} required />
                      </div>
                      <div className="form-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} />
                      </div>
                      <div className="form-group">
                        <label>Giới tính</label>
                        <div className="gender-group">
                          <div className={`radio-option ${form.gender === 'Nam' ? 'active' : ''}`} onClick={() => selectGender('Nam')}>
                            <span>Nam</span>
                          </div>
                          <div className={`radio-option ${form.gender === 'Nữ' ? 'active' : ''}`} onClick={() => selectGender('Nữ')}>
                            <span>Nữ</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Số CCCD/CMND <span className="required">*</span></label>
                        <input name="idCard" value={form.idCard} onChange={onChange} required />
                      </div>
                      <div className="form-group full-width">
                        <label>Địa chỉ</label>
                        <textarea rows={3} name="address" value={form.address} onChange={onChange} />
                      </div>
                    </div>
                  </div>

                  {/* Phần Thông Tin Bằng Lái Xe đã được loại bỏ theo yêu cầu */}
                  <div className="btn-container">
                    <button type="submit" className="btn btn-primary">💾 Lưu thay đổi</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setForm({
                      username: initialUser.Username,
                      email: initialUser.Email,
                      role: initialUser.Role,
                      fullName: initialUser.FullName,
                      phone: initialUser.Phone,
                      dateOfBirth: initialUser.DateOfBirth,
                      gender: initialUser.Gender,
                      idCard: initialUser.IDCard,
                      address: initialUser.Address,
                      licenseClass: initialUser.LicenseClass,
                      licenseDate: initialUser.LicenseDate,
                      licenseScore: initialUser.LicenseScore,
                    })}>🔄 Đặt lại</button>
                    <button type="button" className="btn btn-secondary" onClick={()=>setEditing(false)}>Hủy</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab: Mật khẩu */}
          {tab === 'password' && (
            <div className="form-container">
              <div className="form-section">
                <h2 className="section-title">Đổi mật khẩu</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" placeholder="••••••" />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" placeholder="Mật khẩu mới" />
                  </div>
                  <div className="form-group">
                    <label>Nhập lại mật khẩu mới</label>
                    <input type="password" placeholder="Nhập lại mật khẩu" />
                  </div>
                </div>
                <div className="btn-container">
                  <button className="btn btn-primary" type="button">Cập nhật mật khẩu</button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Chứng chỉ */}
          {tab === 'cert' && (
            <div className="form-container">
              <div className="form-section">
                <h2 className="section-title">Chứng chỉ của bạn</h2>
                <div style={{ color: '#cfcfe1' }}>
                  {/* Placeholder: sẽ kết nối DB ở bước sau */}
                  Chưa có chứng chỉ. Hãy thi thật và đạt đủ điểm để nhận chứng chỉ.
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
