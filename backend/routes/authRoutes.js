const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout, uploadAvatar, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: function (req, file, cb) {
    const userId = req.user?.userId || 'anonymous';
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.png';
    cb(null, `${userId}-${Date.now()}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Định dạng ảnh không hợp lệ'));
};

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter });

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

// Logout user
router.post('/logout', authenticateToken, logout);

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);

// Update profile
router.put('/profile', authenticateToken, updateProfile);

// Change password (protected route)
router.post('/change-password', authenticateToken, changePassword);

// Forgot password (public route)
router.post('/forgot-password', forgotPassword);

// Reset password (public route)
router.post('/reset-password', resetPassword);

module.exports = router;
