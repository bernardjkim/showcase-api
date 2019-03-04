const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
// const rpc = require('./rpc');
const EXCHANGE = 'api';

/**
 * Load number of likes and append to req
 */
async function load(req, res, next, id) {
  const query = { article: id };
  mqClient
    .publish(docToMsg(query), EXCHANGE, 'db.req.like.get')
    .then(msgToDoc)
    .then(checkError)
    .then(doc => (req.likes = doc.likes))
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
 * Create new like
 * @property  {string}  req.body.articleId  - Article id
 * @property  {User}    req.user            - User object
 */
async function create(req, res, next) {
  const like = {
    article: req.body.articleId,
    user: req.user['_id'],
  };
  mqClient
    .publish(docToMsg(like), EXCHANGE, 'db.req.like.create')
    .then(msgToDoc)
    .then(checkError)
    .then(doc => res.status(httpStatus.CREATED).json({ like: doc.like }))
    .catch(next);
}

async function update(req, res, next) {
  const query = {};
  const like = {};
  mqClient
    .publish(
      Buffer.from(JSON.stringify({ query, like }), 'api', 'db.req.like.update'),
    )
    .then(doc => res.json({ like: JSON.parse(doc.toString()) }))
    .catch(next);
}

async function remove(req, res, next) {
  const query = {};
  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'api', 'db.req.like.delete')
    .then(doc => res.json({ like: JSON.parse(doc.toString()) }))
    .catch(next);
}

module.exports = { load, get, create, update, remove };
