const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 * Load user and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  mqClient
    .publish(docToMsg(query), EXCHANGE, 'db.req.user.get')
    .then(msgToDoc)
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

  mqClient
    .publish(docToMsg(user), EXCHANGE, 'db.req.user.create')
    .then(msgToDoc)
    .then(checkError)
    .then(content => res.status(httpStatus.CREATED).json({ user: content.doc }))
    .catch(next);
}

async function update(req, res, next) {
  // const query = {};
  // const user = {};
  // mqClient
  //   .publish(docToMsg({ query, user }), EXCHANGE, 'db.req.user.update')
  //   .then(msgToDoc)
  //   .then(checkError)
  //   .then(content => res.json({ user: content.doc }))
  //   .catch(next);
}

async function remove(req, res, next) {
  // const query = {};
  // mqClient
  //   .publish(docToMsg(query), EXCHANGE, 'db.req.user.delete')
  //   .then(msgToDoc)
  //   .then(checkError)
  //   .then(content => res.json({ user: content.doc }))
  //   .catch(next);
}

module.exports = { load, get, create, update, remove };
