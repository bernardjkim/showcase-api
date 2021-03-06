const express = require('express');
const comment = require('./controller');
const auth = require('../auth/controller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/comment/?article=${article} - Get comments for specified article */
  .get(comment.list)

  /** POST /api/comment - Create new comment */
  .post(auth.parse, auth.authenticate, comment.create);

router
  .route('/:comment')

  /** GET /api/comment/:comment - Get specified comment */
  .get(comment.get);

router.param('comment', comment.load);

module.exports = router;
