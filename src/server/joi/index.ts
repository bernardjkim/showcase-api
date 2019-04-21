import {NextFunction, Request, Response} from 'express';
import {BAD_REQUEST} from 'http-status';
import * as Joi from 'joi';
import {APIError} from '../error/APIError';

/**
 * Validation options
 */
const validationOptions = {
  allowUnknown: true,  // allow unknown keys that will be ignored
};

/**
 * This function takes a joi validation schema and returns a middleware function
 * to handle request validation.
 *
 * @param   {object}    schema  - Joi validation schema
 * @returns {Function}          - Middleware function to handle req validation
 */
const validate = (schema: Joi.SchemaLike) =>
    (req: Request, res: Response, next: NextFunction) => {
      Joi.validate(req, schema, validationOptions, err => {
        if (err) {
          const error =
              new APIError(`Invalid request data: ${err.message}`, BAD_REQUEST);
          return next(error);
        }
        next();
      });
    };

module.exports = {validate};
