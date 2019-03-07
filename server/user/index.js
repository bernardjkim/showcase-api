const express = require('express');
const { validate } = require('../joi');
const paramValidation = require('../../config/param-validation');
const user = require('./controller');
const auth = require('../auth/controller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/user - Get list of users */
  // .get( user.list)

  /** POST /api/user - Create new user */
  .post(validate(paramValidation.createUser), user.create);

router
  .route('/current')

  /** GET /api/user/current - Get current user */
  .get(auth.parse, user.get);

router
  .route('/:user')

  /** GET /api/user/:user - Get user */
  .get(user.get);

/** Load user when API with id route parameter is hit */
router.param('user', user.load);

module.exports = router;
