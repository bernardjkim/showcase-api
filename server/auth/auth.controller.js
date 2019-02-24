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
async function create(req, res, next) {
  const { email, password } = req.body;

  // validate email
  const user = await User.findOne({ email }).catch(e => next(e));
  if (!user) {
    const error = new APIError('Invalid email!', httpStatus.NOT_FOUND);
    next(error);
    return;
  }

  // validate password
  const validPass = await user.comparePassword(password).catch(e => next(e));

  // create jwt
  const token = await sign({ user: user.toJSON() }).catch(e => next(e));
  const options = {
    // maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
  };

  if (validPass && token) {
    // set cookie and send response
    res.cookie('jwt', token, options);
    res.status(httpStatus.NO_CONTENT).send();
  }
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

  // decode jwt
  const decoded = await decode(token).catch(e => next(e));
  // const {iat, exp} = decoded;

  // validate user still exists in database
  const user = await User.findById(decoded.user['_id']).catch(e => next(e));
  req.user = user;
  return next();
}

/**
 * Verify that the JWT was parsed and user was appeneded to req
 */
function authenticate(req, res, next) {
  if (req.user) return next();
  const error = new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  return next(error);
}

module.exports = { authenticate, create, parse, remove };
