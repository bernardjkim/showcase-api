const express = require('express');
const multer = require('multer');
const paramValidation = require('../../config/param-validation');
const cacheMiddleware = require('../cache');
const article = require('./controller');
const auth = require('../auth/controller');
const { validate } = require('../joi');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/article - Get list of articles */
  .get(article.all)

  /** POST /api/article - Create new article */
  .post(
    auth.parse,
    auth.authenticate,
    multer().single('file'),
    article.parse,
    validate(paramValidation.createArticle),
    article.create,
  );

router
  .route('/all')

  /** GET /api/article/all - Get list of articles  */
  .get(article.all);

router
  .route('/search')

  /** GET /api/article/search?q={search string} - Get list of articles */
  .get(article.search);

router
  .route('/:article')

  /** GET /api/article/:id - Get article */
  .get(article.get);

// =============================================================================
router.route('/cache/all').get(cacheMiddleware(10), article.all);
router.route('/cache/search').get(cacheMiddleware(10), article.search);
router.route('/cache/:article').get(cacheMiddleware(10), article.get);
// =============================================================================

/** Load article when API with id route parameter is hit */
router.param('article', article.load);

module.exports = router;
