export const API_BASE = 'http://localhost:5000';
export const getToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch {
    return '';
  }
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => Boolean(getToken());

export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // ignore
  }
};

export const fetchProfile = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
};

export const updateProfileApi = async (payload) => {
  const token = getToken();
  if (!token) throw new Error('Not logged in');
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Update profile failed');
  }
  return data?.user;
};

export const isProfileComplete = (profile) => {
  if (!profile) return false;
  const requiredFields = ['fullName', 'phone', 'dateOfBirth', 'gender', 'address', 'idCard'];
  const hasAllRequired = requiredFields.every((key) => {
    const value = profile[key];
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return Boolean(value);
  });
  // profileImage is nice-to-have, not required for allowing exam/navigation
  return hasAllRequired;
};

export const uploadAvatar = async (file) => {
  const token = getToken();
  if (!token || !file) return null;
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    const res = await fetch(`${API_BASE}/api/auth/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.profileImage || null;
  } catch {
    return null;
  }
};

