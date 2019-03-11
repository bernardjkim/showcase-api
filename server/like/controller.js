const httpStatus = require('http-status');
const { exchange } = require('../amqp');
const { checkError } = require('../../util/mq');

/**
 * Load specified like
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  exchange
    .rpc(query, 'req.like.get')
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => (req.like = content.doc))
    .then(() => next())
    .catch(next);
}

/**
 * Get likes
 * @property  {Like[]}  req.likes - Number of likes for article
 * @returns   {Like[]}            - Object containing article id and number of likes
 */
function get(req, res) {
  return res.json({ likes: req.likes });
}

/**
 * TODO
 */
function list(req, res, next) {
  const { article, user } = req.query;
  const query = { article, user };
  exchange
    .rpc(query, 'req.like.list')
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => res.json({ likes: content.docs }))
    .catch(next);
}

/**
 * Create new like
 * @property  {string}  req.body.articleId  - Article id
 * @property  {User}    req.user            - User object
 */
async function create(req, res, next) {
  const like = {
    article: req.body.articleId,
    user: req.user['_id'],
  };
  exchange
    .rpc(like, 'req.like.create')
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => res.status(httpStatus.CREATED).json({ like: content.doc }))
    .catch(next);
}

/**
 * TODO:
 */
async function update(req, res, next) {}

/**
 * TODO:
 */
async function remove(req, res, next) {}

module.exports = { load, get, list, create, update, remove };
