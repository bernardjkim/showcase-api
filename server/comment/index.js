const express = require('express');
const comment = require('./comment.controller');
const auth = require('../auth/auth.controller');
const { redisMiddleware } = require('../redis');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')

  /** POST /api/comment - Create new comment */
  .post(auth.parse, auth.authenticate, comment.create);

router
  .route('/:article')

  /** GET /api/comment/:articleId - Get comments for specified article */
  .get(redisMiddleware, comment.get);

router.param('article', comment.load);

module.exports = router;
