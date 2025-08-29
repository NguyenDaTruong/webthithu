import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import { isLoggedIn, fetchProfile, uploadAvatar, API_BASE, updateProfileApi, getToken } from '../utils/auth';
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

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [certLoading, setCertLoading] = useState(false);
  const [certStatus, setCertStatus] = useState({ hasCertificate: false, certificate: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 2500);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: form.username,
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
        address: form.address,
        idCard: form.idCard
      };
      console.log('[ProfilePage] submit payload', payload);
      const updated = await updateProfileApi(payload);
      setForm({
        username: updated.username || '',
        email: updated.email || '',
        role: updated.role || 'user',
        fullName: updated.fullName || '',
        phone: updated.phone || '',
        dateOfBirth: updated.dateOfBirth ? String(updated.dateOfBirth).slice(0,10) : '',
        gender: updated.gender || '',
        idCard: updated.idCard || '',
        address: updated.address || '',
        licenseClass: updated.licenseClass || '',
        licenseDate: updated.licenseDate ? String(updated.licenseDate).slice(0,10) : '',
        licenseScore: Number(updated.licenseScore || 0)
      });
      setEditing(false);
      showToast('Cập nhật thông tin thành công!', 'success');
    } catch (err) {
      console.error('[ProfilePage] update error', err);
      showToast(err?.message || 'Cập nhật thất bại', 'error');
    }
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
      // Load certificate status
      try {
        setCertLoading(true);
        const res = await fetch(`${API_BASE}/api/certificate/status`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (res.ok) {
          setCertStatus({ hasCertificate: Boolean(data?.hasCertificate), certificate: data?.certificate || null });
        } else {
          setCertStatus({ hasCertificate: false, certificate: null });
        }
      } catch (e) {
        setCertStatus({ hasCertificate: false, certificate: null });
      } finally {
        setCertLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="profile-container">
      {toast.show && (
        <div style={{position:'fixed', top:16, right:16, zIndex:1000, background: toast.type==='success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)', color:'#fff', padding:'10px 14px', borderRadius:8, boxShadow:'0 6px 20px rgba(0,0,0,0.2)'}}>
          {toast.message}
        </div>
      )}
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
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const currentPassword = e.target.currentPassword.value;
                  const newPassword = e.target.newPassword.value;
                  const confirmPassword = e.target.confirmPassword.value;
                  
                  if (newPassword !== confirmPassword) {
                    showToast('Mật khẩu xác nhận không khớp', 'error');
                    return;
                  }
                  
                  if (newPassword.length < 6) {
                    showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
                    return;
                  }
                  
                  try {
                    const response = await fetch(`${API_BASE}/api/auth/change-password`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                      },
                      body: JSON.stringify({ currentPassword, newPassword })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      showToast('Đổi mật khẩu thành công!', 'success');
                      e.target.reset();
                    } else {
                      showToast(data.message || 'Đổi mật khẩu thất bại', 'error');
                    }
                  } catch (error) {
                    console.error('Change password error:', error);
                    showToast('Lỗi kết nối server', 'error');
                  }
                }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mật khẩu hiện tại <span className="required">*</span></label>
                      <input 
                        type="password" 
                        name="currentPassword"
                        placeholder="••••••" 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mật khẩu mới <span className="required">*</span></label>
                      <input 
                        type="password" 
                        name="newPassword"
                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nhập lại mật khẩu mới <span className="required">*</span></label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu" 
                        required
                      />
                    </div>
                  </div>
                  <div className="btn-container">
                    <button className="btn btn-primary" type="submit">🔐 Cập nhật mật khẩu</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab: Chứng chỉ */}
          {tab === 'cert' && (
            <div className="form-container">
              <div className="form-section">
                <h2 className="section-title">Chứng chỉ của bạn</h2>
                {certLoading ? (
                  <div style={{ color:'#cfcfe1' }}>Đang tải trạng thái chứng chỉ...</div>
                ) : certStatus.hasCertificate && certStatus.certificate ? (
                  <div className="profile-summary">
                    <div className="summary-grid">
                      <div className="summary-item"><span className="label">Trạng thái</span><span className="value" style={{color:'#10b981'}}>Đã đạt</span></div>
                      <div className="summary-item"><span className="label">Mã chứng chỉ</span><span className="value">CERT-{certStatus.certificate.Id || certStatus.certificate.id}</span></div>
                      <div className="summary-item"><span className="label">Ngày cấp</span><span className="value">{certStatus.certificate.issuedAt ? String(certStatus.certificate.issuedAt).slice(0,10) : '-'}</span></div>
                      <div className="summary-item"><span className="label">Kết quả</span><span className="value">{typeof certStatus.certificate.score === 'number' ? `${certStatus.certificate.score}/10` : '-'}</span></div>
                    </div>
                    <div className="btn-container" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => navigate('/certificate')}>Xem chứng chỉ</button>
                      {form.role === 'admin' && (
                        <button className="btn btn-secondary" onClick={async ()=>{
                          try {
                            const res = await fetch(`${API_BASE}/api/certificate/dev-reset`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } });
                            if (res.ok) {
                              setCertStatus({ hasCertificate: false, certificate: null });
                              showToast('Đã reset chứng chỉ test', 'success');
                            } else {
                              const data = await res.json();
                              showToast(data?.message || 'Không thể reset', 'error');
                            }
                          } catch (e) {
                            showToast('Lỗi kết nối khi reset', 'error');
                          }
                        }}>Dev: Reset chứng chỉ</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#cfcfe1' }}>
                    Chưa có chứng chỉ. Hãy thi thật và đạt đủ điểm để nhận chứng chỉ.
                  </div>
                )}
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
