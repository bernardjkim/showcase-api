const express = require('express');
const like = require('./controller');
const auth = require('../auth/controller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/like - Get likes for the specified article */
  .get(like.list)

  /** POST /api/like - Create new like */
  .post(auth.parse, auth.authenticate, like.create);

router
  .route('/:like')

  /** GET /api/like/:like - Get specified like */
  .get(like.get);

router.param('like', like.load);

module.exports = router;
