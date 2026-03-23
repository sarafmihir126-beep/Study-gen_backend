const express = require('express');
const router = express.Router();
const { analyzeUrl, getReportHistory, getReportById } = require('../controllers/analyzeController');
const { protect } = require('../middleware/authMiddleware');

// Using protect so only logged in users can see reports that belong to them
router.post('/', protect, analyzeUrl);
router.get('/history', protect, getReportHistory);
router.get('/:id', protect, getReportById);

module.exports = router;
