const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');

const auth = require('./auth.controller');

router
  .route('/')

  /** POST /api/auth - authenticate user */
  .post(validate(paramValidation.createAuth), auth.create)

  /** DELETE /api/auth  - delete cookie */
  .delete(auth.remove);

module.exports = router;
