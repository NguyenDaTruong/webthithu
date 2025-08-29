const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/certificateController');

// All certificate routes require auth
router.post('/eligibility', authenticateToken, controller.evaluateEligibility);
router.get('/status', authenticateToken, controller.getStatus);
router.post('/issue-name', authenticateToken, controller.issueName);
router.get('/:id', authenticateToken, controller.getCertificateById);
// Dev reset
router.post('/dev-reset', authenticateToken, controller.devReset);
router.post('/dev-pass', authenticateToken, controller.devPass);

module.exports = router;



