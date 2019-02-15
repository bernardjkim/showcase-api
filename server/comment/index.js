const express = require('express');
const comment = require('./comment.controller');
const auth = require('../auth/auth.controller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')

  /** POST /api/comment - Create new comment */
  .post(auth.parse, auth.authenticate, comment.create);

router
  .route('/:articleId')

  /** GET /api/comment/:articleId - Get comments for specified article */
  .get(comment.get);

router.param('articleId', comment.load);

module.exports = router;
