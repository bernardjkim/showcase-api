const httpStatus = require('http-status');
const Comment = require('./comment.model');
const Article = require('../article/article.model');

/**
 * Load comments and append to req
 */
async function load(req, res, next, id) {
  const comments = await Comment.getByArticle(id).catch(e => next(e));
  req.articleId = id;
  req.comments = comments;
  return next();
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
  // verify article exists
  const article = await Article.get(req.body.articleId).catch(e => next(e));

  // create comment
  const comment = await Comment.create({
    article: article['_id'],
    value: req.body.value,
    user: req.user,
  });

  // send response
  res.status(httpStatus.CREATED).json({ comment });
}

module.exports = { get, create, load };
