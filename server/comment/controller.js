const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 * Load comments and append to req
 */
async function load(req, res, next, id) {
  const query = { article: id };
  mqClient
    .publish(docToMsg(query), EXCHANGE, 'db.req.comment.get')
    .then(msgToDoc)
    .then(checkError)
    .then(doc => (req.comments = doc.comments))
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
    .then(doc => res.status(httpStatus.CREATED).json({ comment: doc.comment }))
    .catch(next);
}

module.exports = { get, create, load };
