const Joi = require('joi');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');

/**
 * Validation options
 */
const validationOptions = {
  allowUnknown: true, // allow unknown keys that will be ignored
};

/**
 * This function takes a joi validation schema and returns a middleware function
 * to handle request validation.
 *
 * @param   {object}    schema  - Joi validation schema
 * @returns {Function}          - Middleware function to handle req validation
 */
const validate = schema => (req, res, next) => {
  Joi.validate(req, schema, validationOptions, err => {
    if (err) {
      const error = new APIError(
        `Invalid request data: ${err.message}`,
        httpStatus.BAD_REQUEST,
      );
      return next(error);
    }
    next();
  });
};

module.exports = { validate };
