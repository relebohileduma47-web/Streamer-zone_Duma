const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/commentController');

router.post(
  '/',
  [
    body('contentId').isMongoId().withMessage('A valid contentId is required'),
    body('displayName').trim().isLength({ min: 2, max: 40 }).withMessage('Display name must be 2-40 characters'),
    body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters'),
    body('viewerId').optional().isString().isLength({ max: 100 }),
  ],
  validate,
  c.create
);

// Creator moderation
router.get('/', protect, c.listAll);
router.patch(
  '/:id/status',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid comment id'),
    body('status').isIn(['pending', 'approved', 'hidden']).withMessage('Status must be pending, approved or hidden'),
  ],
  validate,
  c.setStatus
);
router.delete('/:id', protect, param('id').isMongoId().withMessage('Invalid comment id'), validate, c.remove);

// Public
router.get('/:contentId', param('contentId').isMongoId().withMessage('Invalid content id'), validate, c.listForContent);

module.exports = router;
