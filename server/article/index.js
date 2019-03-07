const express = require('express');
const multer = require('multer');
const paramValidation = require('../../config/param-validation');
const article = require('./controller');
const auth = require('../auth/controller');
const { cacheMiddleware } = require('../../system/cache');
const { validate } = require('../joi');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/article - Get list of articles */
  .get(cacheMiddleware(30), article.all)

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
  .get(cacheMiddleware(30), article.all);

router
  .route('/search')

  /** GET /api/article/search?q={search string} - Get list of articles */
  .get(cacheMiddleware(30), article.search);

router
  .route('/:article')

  /** GET /api/article/:id - Get article */
  .get(cacheMiddleware(30), article.get);

module.exports = router;
