const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');

/**
 * Load comments and append to req
 */
async function load(req, res, next, id) {
  const query = { article: id };

  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'api', 'db.req.comment.get')
    .then(reply => {
      const doc = JSON.parse(reply.toString());
      if (doc.error)
        return next(new APIError(doc.error.message), httpStatus.BAD_REQUEST);
      req.comments = doc.comments;
      next();
    })
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
    .publish(
      Buffer.from(JSON.stringify(comment)),
      'api',
      'db.req.comment.create',
    )
    .then(reply => {
      const doc = JSON.parse(reply.toString());
      if (doc.error)
        return next(new APIError(doc.error.message), httpStatus.BAD_REQUEST);
      res.status(httpStatus.CREATED).json({ comment: doc.comment });
    })
    .catch(next);
}

module.exports = { get, create, load };
