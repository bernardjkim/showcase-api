const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 *
 */
function current(req, res, next) {
  if (!req.user) return next();

  req.url = `/${req.user['_id']}`;
  req.originalUrl = `${req.baseUrl}${req.url}`;
  next();
}

/**
 * Get a single user
 * @property  {User}  req.user  - User object
 * @returns   {User}
 */
function get(req, res, next) {
  const query = { _id: req.params.user };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.user.get').catch(next);
}

/**
 * Get a list of users
 */
function list(req, res, next) {
  const query = { _id: req.params.user };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.user.list').catch(next);
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

  mqClient.publish(docToMsg(user), EXCHANGE, 'db.req.user.create').catch(next);
}

async function update(req, res, next) {
  const query = {};
  const user = {};
  mqClient.publish(docToMsg({ query, user }), EXCHANGE, 'db.req.user.update').catch(next);
}

async function remove(req, res, next) {
  const query = {};
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.user.delete').catch(next);
}

module.exports = { current, get, list, create, update, remove };
