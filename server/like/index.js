const express = require('express');
const like = require('./like.controller');
const auth = require('../auth/auth.controller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')

  /** GET /api/like - Get all list of user's likes */
  .get(auth.parse, like.list)

  /** POST /api/like - Create new like */
  .post(auth.parse, auth.authenticate, like.create);

router
  .route('/:article')

  /** GET /api/like/:article - Get likes for specified article */
  .get(like.get);

router.param('article', like.load);

module.exports = router;
