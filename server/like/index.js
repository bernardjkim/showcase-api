const express = require('express');
const like = require('./controller');
const auth = require('../auth/controller');
const { cacheMiddleware } = require('../../system/cache');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/like/?article=${article}&user=${user} - Get list of likes */
  .get(cacheMiddleware(30), like.list)

  /** POST /api/like - Create new like */
  .post(auth.parse, auth.authenticate, like.create);

router
  .route('/:like')

  /** GET /api/like/:like - Get the specified like */
  .get(cacheMiddleware(30), like.get);

module.exports = router;
