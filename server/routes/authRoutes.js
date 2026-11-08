const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { login, me } = require('../controllers/authController');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);
router.get('/me', protect, me);

module.exports = router;
