const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const { sign, decode } = require('../../util/jwt');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 * Returns jwt token if valid email and password is provided
 *
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 */
async function create(req, res, next) {
  const { email, password } = req.body;
  const options = {
    // maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
  };

  const auth = { email, password };
  mqClient
    .publish(docToMsg(auth), EXCHANGE, 'db.req.auth.create')
    .then(msgToDoc)
    .then(checkError)
    .then(sign)
    .then(token => res.cookie('jwt', token, options))
    .then(() => res.status(httpStatus.NO_CONTENT))
    .then(() => res.send())
    .catch(next);
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
  if (!decoded) return next();
  // const {iat, exp} = decoded;

  req.user = decoded.user;
  next();
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
