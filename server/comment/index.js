const express = require('express');
const comment = require('./controller');
const auth = require('../auth/controller');
const { cacheMiddleware } = require('../../system/cache');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/comment/?article=${article}&user=${user} - Get a list of comments */
  .get(cacheMiddleware(30), comment.list)

  /** POST /api/comment - Create new comment */
  .post(auth.parse, auth.authenticate, comment.create);

router
  .route('/:comment')

  /** GET /api/comment/:comment - Get the specified comment */
  .get(cacheMiddleware(30), comment.get);

module.exports = router;
