const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const c = require('../controllers/likeController');

router.post(
  '/',
  [
    body('contentId').isMongoId().withMessage('A valid contentId is required'),
    body('viewerId').isString().withMessage('A valid viewerId is required').bail().trim().isLength({ min: 8, max: 100 }).withMessage('A valid viewerId is required'),
  ],
  validate,
  c.toggle
);
router.get('/:contentId', param('contentId').isMongoId().withMessage('Invalid content id'), validate, c.status);

module.exports = router;
