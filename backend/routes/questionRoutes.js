const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', questionController.getAllQuestions);
router.get('/random', questionController.getRandomQuestions); // Thêm route mới

// Routes mới cho tạo đề thi
router.post('/create-exam', questionController.createExam);
router.get('/create-default-exam', questionController.createDefaultExam);
router.get('/exam/:examId', questionController.getExamById);

// Routes để kiểm tra và debug
router.get('/check-structure', questionController.checkTableStructure);
router.get('/check-data', questionController.checkTableData);

module.exports = router;