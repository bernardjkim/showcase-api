const httpStatus = require('http-status');
const Comment = require('./comment.model');
const Article = require('../article/article.model');

/**
 * Load comments and append to req
 */
function load(req, res, next, id) {
  Comment.getByArticle(id)
    .then(comments => {
      req.articleId = id;
      req.comments = comments;
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get comments
 * @returns {Comments}
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
function create(req, res, next) {
  // verify article exists
  Article.get(req.body.articleId)
    .then(article => {
      Comment.create({
        article: article._id, // eslint-disable-line no-underscore-dangle
        value: req.body.value,
        user: req.user,
      })
        .then(savedComment =>
          res.status(httpStatus.CREATED).json({ comment: savedComment }),
        )
        .catch(e => next(e));
    })
    .catch(e => next(e));
}

module.exports = { get, create, load };
