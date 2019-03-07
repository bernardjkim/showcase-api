const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 * Load comments and append to req
 */
async function load(req, res, next, id) {
  const query = { article: id };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.comment.get').catch(next);
}

/**
 * Get comments
 * @property  {Comment[]} - Array of comments
 * @returns   {Comment[]}
 */
function get(req, res, next) {
  const query = { article: req.params.article };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.comment.get').catch(next);
}

/**
 * TODO
 */
function list(req, res, next) {
  const { article, user } = req.query;
  const query = { article, user };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.comment.list').catch(next);
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

  mqClient.publish(docToMsg(comment), EXCHANGE, 'db.req.comment.create').catch(next);
}

module.exports = { get, list, create, load };
