import * as Joi from 'joi';

/**
 * Validation options
 */
const validationOptions: Joi.ValidationOptions = {
  allowUnknown: true,  // allow unknown keys that will be ignored
};

const validate = (schema: Joi.SchemaLike) => (data: object) => {
  Joi.validate(data, schema, validationOptions, err => {
    if (err) throw new Error(`Invalid request: ${err.message}`);
  });
};

export {validate};
