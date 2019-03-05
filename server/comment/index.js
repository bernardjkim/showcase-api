const express = require('express');
const comment = require('./controller');
const auth = require('../auth/controller');
const { redisMiddleware } = require('../redis');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')

  /** POST /api/comment - Create new comment */
  .post(auth.parse, auth.authenticate, comment.create);

router
  .route('/:article')

  /** GET /api/comment/:article - Get comments for specified article */
  .get(redisMiddleware, comment.get);

/** test no cache */
router.route('/:article/bypass').get(comment.get);

router.param('article', comment.load);

module.exports = router;
