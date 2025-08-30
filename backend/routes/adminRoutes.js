const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');

// Import admin controllers
const adminController = require('../controllers/adminController');

// Tất cả routes đều yêu cầu admin authentication
router.use(authenticateAdmin);

// Dashboard overview
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);

// Question Management
router.get('/questions', adminController.getQuestions);
router.get('/questions/:id', adminController.getQuestionById);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Category Management
router.get('/categories', adminController.getCategories);

// Exam Management
router.get('/exams', adminController.getExams);

// Practice Exam Management
router.get('/practice-exams', adminController.getPracticeExams);

module.exports = router;
