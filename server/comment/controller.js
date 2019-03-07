const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 * Load comments and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  mqClient
    .publish(docToMsg(query), EXCHANGE, 'db.req.comment.get')
    .then(msgToDoc)
    .then(checkError)
    .then(content => (req.comment = content.doc))
    .then(() => next())
    .catch(next);
}

/**
 * Get comments
 * @property  {Comment[]} - Array of comments
 * @returns   {Comment[]}
 */
function get(req, res) {
  return res.json({ comments: req.comments });
}

/**
 * TODO
 */
function list(req, res, next) {
  const { article, user } = req.query;
  const query = { article, user };
  mqClient
    .publish(docToMsg(query), EXCHANGE, 'db.req.comment.list')
    .then(msgToDoc)
    .then(checkError)
    .then(content => res.json({ comments: content.docs }))
    .catch(next);
}

/**
 * Create new comment
 * @property  {string}  req.body.articleId  - Article id
 * @property  {string}  req.body.value      - Comment value
 * @property  {User}    req.user            - Posting user
 *
 */
async function create(req, res, next) {
  const comment = {
    article: req.body.articleId,
    user: req.user['_id'],
    value: req.body.value,
  };

  mqClient
    .publish(docToMsg(comment), EXCHANGE, 'db.req.comment.create')
    .then(msgToDoc)
    .then(checkError)
    .then(content => res.status(httpStatus.CREATED).json({ comment: content.doc }))
    .catch(next);
}

/**
 * TODO
 */
function update() {}

/**
 * TODO
 */
function remove() {}

module.exports = { get, list, create, load, update, remove };
