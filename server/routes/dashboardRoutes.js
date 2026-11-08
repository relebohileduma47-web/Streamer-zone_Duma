const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { stats } = require('../controllers/dashboardController');

router.get('/stats', protect, stats);

module.exports = router;
