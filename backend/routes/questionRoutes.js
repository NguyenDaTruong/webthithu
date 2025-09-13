const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', questionController.getAllQuestions);
router.get('/random', questionController.getRandomQuestions);
router.get('/official', questionController.getOfficialExamQuestions); // Thêm route mới

module.exports = router;