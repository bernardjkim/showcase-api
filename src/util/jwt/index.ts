import { sign as _sign, verify, SignOptions } from 'jsonwebtoken';

import { jwtSecret } from '../../config/config';

/**
 * This function takes in a payload and optional sign options and will return
 * a promise returning either a jwt token or an error.
 *
 * @param   {object}  payload
 * @param   {SignOptions}  options (optional sign options)
 * @returns {Promise<string>}         signed jwt token
 */
function sign(
  payload: object,
  options: SignOptions = {
    expiresIn: '7 days',
  },
): Promise<string> {
  return new Promise((resolve, reject) => {
    _sign(payload, jwtSecret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });
}

/**
 * Decode token.
 * @param   {string} payload  - Token
 * @returns {Promise<any>}
 */
function decode(payload: string): Promise<any> {
  return new Promise((resolve, reject) => {
    verify(payload, jwtSecret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

export { sign, decode };
