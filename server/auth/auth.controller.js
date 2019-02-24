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

  const decoded = await decode(token).catch(e => next(e));
  // const {iat, exp} = decoded;

  // validate user still exists in database
  const user = await User.findById(decoded.user['_id']).catch(e => next(e));

  if (!user) {
    const error = new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
    return next(error);
  }

  req.user = user;
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
