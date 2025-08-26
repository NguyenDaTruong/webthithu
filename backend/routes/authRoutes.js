const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', getProfile);

module.exports = router;
