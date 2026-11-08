const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const Content = require('../models/Content');
const c = require('../controllers/contentController');

const idRule = param('id').isMongoId().withMessage('Invalid content id');
const optionalUrl = (field) =>
  body(field).optional({ values: 'falsy' }).isURL({ require_protocol: true }).withMessage(`${field} must be a valid URL (include https://)`);

const contentRules = (isUpdate) => {
  const required = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    required(body('title').trim().isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters')),
    required(body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required (max 1000 characters)')),
    required(body('category').isIn(Content.CATEGORIES).withMessage(`Category must be one of: ${Content.CATEGORIES.join(', ')}`)),
    required(body('type').isIn(Content.TYPES).withMessage(`Type must be one of: ${Content.TYPES.join(', ')}`)),
    body('status').optional().isIn(Content.STATUSES).withMessage('Status must be draft, published or scheduled'),
    body('publishDate').optional({ values: 'falsy' }).isISO8601().withMessage('Publication date must be a valid date'),
    body('featured').optional().isBoolean().withMessage('Featured must be true or false'),
    optionalUrl('thumbnailUrl'),
    optionalUrl('mediaUrl'),
  ];
};

// Public
router.get('/', c.listPublished);
// Creator only (declared before '/:id' so "manage" is not treated as an id)
router.get('/manage/all', protect, c.listAll);
router.post('/', protect, contentRules(false), validate, c.create);

router.get('/:id', idRule, validate, optionalAuth, c.getOne);
router.post('/:id/view', idRule, validate, c.recordView);
router.put('/:id', protect, idRule, contentRules(true), validate, c.update);
router.delete('/:id', protect, idRule, validate, c.remove);

module.exports = router;
