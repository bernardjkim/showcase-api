const httpStatus = require('http-status');
const Like = require('./like.model');

const Article = require('../article/article.model');
const APIError = require('../error/APIError');
const amqp = require('../../system/amqp');

/**
 * Load number of likes and append to req
 */
async function load(req, res, next, id) {
  const likes = await Like.getByArticle(id).catch(e => next(e));
  req.articleId = id;
  req.likes = likes;
  return next();
}

/**
 * Get likes
 * @property  {string}  req.articleId - Article ID
 * @property  {number}  req.likes     - Number of likes for article
 * @returns   {object}                - Object containing article id and number of likes
 */
function get(req, res) {
  return res.json({ articleId: req.articleId, likes: req.likes });
}

/**
 * Create new like
 * @property  {string}  req.body.articleId  - Article id
 * @property  {User}    req.user            - User object
 */
async function create(req, res, next) {
  // verify user has not already liked the article
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

  // verify article exists
  const article = await Article.get(req.body.articleId).catch(e => next(e));

  // create like and send response
  if (!(await likedByUser)) {
    const like = new Like({
      article: article['_id'],
      user: req.user['_id'],
    });
    amqp
      .publish('likes', 'likes.event.create', Buffer.from(JSON.stringify(like)))
      .then(ok => {
        console.log('ok', ok);
        res.json({ like });
      })
      .catch(e => next(e));
  }
}

/**
 * Get list of likes
 * @property  {User}    req.user  - User object
 * @returns   {Likes[]}           - Array of likes
 */
async function list(req, res, next) {
  const likes = await Like.find({ user: req.user['_id'] }).catch(e => next(e));
  res.json({ likes });
}

module.exports = { get, create, load, list };
