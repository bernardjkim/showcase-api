const httpStatus = require('http-status');
const Like = require('./like.model');
const Article = require('../article/article.model');
const APIError = require('../error/APIError');

/**
 * Load number of likes and append to req
 */
function load(req, res, next, id) {
  Like.getByArticle(id)
    .then(likes => {
      req.articleId = id;
      req.likes = likes;
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get likes
 * @returns {Likes}
 */
function get(req, res) {
  return res.json({ articleId: req.articleId, likes: req.likes });
}

/**
 * Create new like
 * @property  {string}  req.body.articleId - Article id
 *
 */
async function create(req, res, next) {
  // Verify user has not already liked the article
  const likedByUser = new Promise(resolve => {
    Like.findOne({
      article: req.body.articleId,
      user: req.user,
    })
      .then(liked => {
        if (!liked) return resolve(false);

        const error = new APIError('Already liked', httpStatus.BAD_REQUEST);
        return next(error);
      })
      .catch(e => next(e));
  });

  // Verify article exists
  Article.get(req.body.articleId)
    .then(async article => {
      if (!(await likedByUser)) {
        Like.create({ article, user: req.user })
          .then(() => {
            res.status(httpStatus.NO_CONTENT).send();
          })
          .catch(e => next(e));
      }
    })
    .catch(e => next(e));
}

/**
 * Get list of likes
 *
 * @returns {array} - Array of likes
 */
function list(req, res, next) {
  Like.find({ user: req.user._id }) // eslint-disable-line no-underscore-dangle
    .then(likes => {
      res.json({ likes });
    })
    .catch(e => next(e));
}

module.exports = { get, create, load, list };
