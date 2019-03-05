const express = require('express');
const like = require('./controller');
const auth = require('../auth/controller');
const { redisMiddleware } = require('../redis');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')

  /** POST /api/like - Create new like */
  .post(auth.parse, auth.authenticate, like.create);

router
  .route('/:article')

  /** GET /api/like/:article - Get likes for specified article */
  .get(redisMiddleware, like.get);

router.param('article', like.load);

module.exports = router;
