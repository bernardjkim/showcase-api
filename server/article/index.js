const express = require('express');
const validate = require('express-validation');
const multer = require('multer');
const paramValidation = require('../../config/param-validation');
const article = require('./article.controller');
const auth = require('../auth/auth.controller');

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
  .route('/:id')

  /** GET /api/article/:id - Get article */
  .get(auth.parse, article.get);

/** Load article when API with id route parameter is hit */
router.param('id', article.load);

module.exports = router;
