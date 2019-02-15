const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const User = require('../user/user.model');
const { sign, decode } = require('../../util/jwt');

/**
 * Returns jwt token if valid email and password is provided
 *
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 */
function create(req, res, next) {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) next(new APIError('Invalid email!', httpStatus.NOT_FOUND));
      // Compare password
      else {
        user
          .comparePassword(password)
          .then(() => {
            // Generate jwt token
            sign({ user })
              .then(token => {
                const options = {
                  // maxAge: 1000 * 60 * 15, // would expire after 15 minutes
                  httpOnly: true, // The cookie only accessible by the web server
                  signed: true, // Indicates if the cookie should be signed
                };
                res.cookie('jwt', token, options);
                res.status(httpStatus.NO_CONTENT).send();
              })
              .catch(e => next(e));
          })
          .catch(e => next(e));
      }
    })
    .catch(e => next(e));
}

/**
 * Clears jwt cookie
 */
function remove(req, res) {
  res
    .clearCookie('jwt')
    .status(httpStatus.NO_CONTENT)
    .send();
}

// TODO: handle expired tokens
/**
 * Decode JWT and append user to req
 */
async function parse(req, res, next) {
  const token = req.signedCookies.jwt;
  if (!token) return next();

  const user = new Promise(resolve => {
    decode(token)
      .then(decoded => {
        // const { iat, exp } = decoded;

        // TODO: skip this step and make sure to invalidate JWT when a user is removed

        // validate user still exists in database
        User.findById(decoded.user)
          .then(result => {
            if (result) return resolve(result);
            const error = new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
            return next(error);
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  });

  req.user = await user;
  return next();
}

/**
 * Verify that the JWT was parsed and appened to req
 */
function authenticate(req, res, next) {
  if (req.user) return next();

  const error = new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  return next(error);
}

module.exports = { authenticate, create, parse, remove };
