const Joi = require('joi');

/**
 * Validation options
 */
const validationOptions = {
  allowUnknown: true, // allow unknown keys that will be ignored
};

const validate = schema => data => {
  Joi.validate(data, schema, validationOptions, err => {
    if (err) throw new Error(`Invalid request: ${err.message}`);
  });
};

module.exports = { validate };
