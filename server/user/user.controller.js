const httpStatus = require('http-status');
const User = require('./user.model');

/**
 * Load user and append to req
 */
async function load(req, res, next, id) {
  const user = await User.get(id).catch(e => next(e));
  req.user = user;
  return next();
}
/**
 * Get user
 * @property  {User}  req.user  - User object
 * @returns   {User}
 */
function get(req, res) {
  return res.json({ user: req.user });
}

/**
 * Create new user
 * @property  {string}  req.body.username - Username
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 *
 */
async function create(req, res, next) {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  }).catch(e => next(e));
  res.status(httpStatus.CREATED).json({ user });
}

/**
 * Get list of users
 */
async function list(req, res, next) {
  const users = await User.find().catch(e => next(e));
  res.json({ users });
}

module.exports = { load, get, create, list };
