const express = require('express');
const validate = require('express-validation');
const multer = require('multer');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const paramValidation = require('../../config/param-validation');
const article = require('./article.controller');
const auth = require('../auth/auth.controller');

const router = express.Router(); // eslint-disable-line new-cap

/**
 * Return multer single file upload handler with added error handling
 */
const upload = (req, res, next) =>
  multer().single('file')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      const error = new APIError(
        `Missing required field: 'field'`,
        httpStatus.BAD_REQUEST,
      );
      return next(error);
    } else if (err) {
      return next(err);
    }
    next();
  });

router
  .route('/')
  /** GET /api/article - Get list of articles */
  .get(article.all)

  /** POST /api/article - Create new article */
  .post(
    auth.parse,
    auth.authenticate,
    upload,
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

router
  .route('/redis/:idRedis')

  /** GET /api/article/:id - Get article */
  .get(auth.parse, article.getRedis);

/** Load article when API with id route parameter is hit */
router.param('id', article.load);
router.param('idRedis', article.loadRedis);

module.exports = router;
