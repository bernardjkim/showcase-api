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
    .then(doc => (req.user = doc.user))
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
    .then(doc => res.status(httpStatus.CREATED).json({ user: doc.user }))
    .catch(next);
}

async function update(req, res, next) {
  const query = {};
  const user = {};
  mqClient
    .publish(docToMsg({ query, user }), EXCHANGE, 'db.req.user.update')
    .then(msgToDoc)
    .then(checkError)
    .then(doc => res.json({ user: doc.user }))
    .catch(next);
}

async function remove(req, res, next) {
  const query = {};
  mqClient
    .publish(docToMsg(query), EXCHANGE, 'db.req.user.delete')
    .then(msgToDoc)
    .then(checkError)
    .then(doc => res.json({ user: doc.user }))
    .catch(next);
}

module.exports = { load, get, create, update, remove };
