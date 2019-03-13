const httpStatus = require('http-status');
const { exchange } = require('../amqp');
const { checkError } = require('../../util/mq');
const DB_REQ = 'db.req';

/**
 * Load comments and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  exchange
    .rpc(query, `${DB_REQ}.comment.get`)
    .then(msg => msg.getContent())
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
  exchange
    .rpc(query, `${DB_REQ}.comment.list`)
    .then(msg => msg.getContent())
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

  exchange
    .rpc(comment, `${DB_REQ}.comment.create`)
    .then(msg => msg.getContent())
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
