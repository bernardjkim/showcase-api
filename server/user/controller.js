const httpStatus = require('http-status');
const { exchange } = require('../amqp');
const { checkError } = require('../../util/mq');

/**
 * Load user and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  exchange
    .rpc(query, 'req.user.get')
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => (req.user = content.doc))
    .then(() => next())
    .catch(next);
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
 * Get a list of users
 */
function list(req, res, next) {}

/**
 * Create new user
 * @property  {string}  req.body.username - Username
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 *
 */
async function create(req, res, next) {
  const user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  exchange
    .rpc(user, 'req.user.create')
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => res.status(httpStatus.CREATED).json({ user: content.doc }))
    .catch(next);
}

async function update(req, res, next) {}

async function remove(req, res, next) {}

module.exports = { load, get, create, update, remove };
