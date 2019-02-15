const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const user = require('./user.controller');
const auth = require('../auth/auth.controller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/user - Get list of users */
  // .get(user.list)

  /** POST /api/user - Create new user */
  .post(validate(paramValidation.createUser), user.create);

router
  .route('/current')

  /** GET /api/user/current - Get current user */
  .get(auth.parse, user.get);

router
  .route('/:id')

  /** GET /api/user/:id - Get user */
  .get(user.get);

/** Load user when API with id route parameter is hit */
router.param('id', user.load);

module.exports = router;
