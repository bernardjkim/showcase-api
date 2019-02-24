const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const user = require('./user.controller');
const auth = require('../auth/auth.controller');
const { redisMiddleware } = require('../redis');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/user - Get list of users */
  .get(redisMiddleware, user.list)

  /** POST /api/user - Create new user */
  .post(validate(paramValidation.createUser), user.create);

router
  .route('/current')

  /** GET /api/user/current - Get current user */
  .get(auth.parse, user.get);

router
  .route('/:user')

  /** GET /api/user/:id - Get user */
  .get(redisMiddleware, user.get);

/** Load user when API with id route parameter is hit */
router.param('user', user.load);

module.exports = router;
