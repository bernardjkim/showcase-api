const express = require('express');
const router = express.Router();
const { validate } = require('../joi');
const paramValidation = require('../../config/param-validation');

const auth = require('./controller');

router
  .route('/')

  /** POST /api/auth - authenticate user */
  .post(auth.create)

  /** DELETE /api/auth  - delete cookie */
  .delete(auth.remove);

module.exports = router;
