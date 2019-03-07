const express = require('express');
const { validate } = require('../joi');
const paramValidation = require('../../config/param-validation');
const user = require('./controller');
const auth = require('../auth/controller');
const { cacheMiddleware } = require('../../system/cache');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/user - Get list of users */
  // .get(cacheMiddleware(30), user.list)

  /** POST /api/user - Create new user */
  .post(validate(paramValidation.createUser), user.create);

router
  .route('/current')

  /** GET /api/user/current - Get current user */
  .get(auth.parse, user.current, cacheMiddleware(30), user.get);

router
  .route('/:user')

  /** GET /api/user/:id - Get user */
  .get(cacheMiddleware(30), user.get);

module.exports = router;
