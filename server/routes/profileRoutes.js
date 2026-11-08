const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { getPublicProfile, updateProfile } = require('../controllers/profileController');

router.get('/', getPublicProfile);
router.put(
  '/',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('bio').optional().isLength({ max: 1000 }).withMessage('Introduction can be at most 1000 characters'),
    body('avatarUrl').optional({ values: 'falsy' }).isURL({ require_protocol: true }).withMessage('Profile picture must be a valid URL'),
    body('requireCommentApproval').optional().isBoolean(),
  ],
  validate,
  updateProfile
);

module.exports = router;
