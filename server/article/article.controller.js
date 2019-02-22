const qs = require('qs');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const Article = require('./article.model');
const Like = require('../like/like.model');
const { queryTerm, queryAll } = require('../../util/elasticsearch');
const redis = require('../../util/redis');

const { uploadFile } = require('../../util/s3');

/**
 * Load article and append to req
 *
 */
function load(req, res, next, id) {
  Article.get(id)
    .then(article => {
      req.article = article;
      return next();
    })
    .catch(e => next(e));
}

async function loadRedis(req, res, next, id) {
  const key = `article:${id}`;
  const data = await redis.getAsync(key);

  // cache hit
  if (data) {
    const result = JSON.parse(data);
    req.article = result;
    return next();
  }

  // cache miss

  // acquire lock
  const lock = await redis.redlock.lock(`locks:${key}`, redis.ttl).catch(e => {
    // retry cache lookup if failed to acquire lock
    setTimeout(loadRedis(req, res, next, id), 200);
    return;
  });

  // not sure why, but lock will return undefined sometimes???
  if (!lock) return;

  // fetch resource
  const article = await Article.get(id).catch(e => next(e));

  // update cache with resource
  await redis.setAsync(key, JSON.stringify(article));

  // release lock
  lock.unlock().catch(e => {
    // we weren't able to reach redis; your lock will eventually
    // expire, but you probably want to log this error
    console.error(e);
  });

  // append article and continue to next
  req.article = article;
  return next();
}

/**
 * Parse form and append fields to req
 *
 * @property  {object}  form  - Article form
 */
function parse(req, res, next) {
  const form = qs.parse(req.body.form);
  if (!form) {
    const error = new APIError('Missing form!', httpStatus.BAD_REQUEST);
    next(error);
  } else {
    req.body.title = form.title;
    req.body.uri = form.uri;
    req.body.github = form.github;
    req.body.description = form.description;
    req.body.tags = form.tags;
    next();
  }
}
/**
 * Get article
 * @param   {Article} req.article   - Requested Article
 * @param   {User}    req.User      - Requesting User
 *
 * @returns {Article}
 */
async function get(req, res, next) {
  // Check if article has been liked by current user
  const likedByUser = Like.findOne({
    article: req.article,
    user: req.user,
  }).catch(e => next(e));

  // Get total number of likes for the article
  const likes = Like.getByArticle(req.article).catch(e => next(e));

  // Append data and send response
  const obj = req.article.toObject();
  obj.likes = await likes;
  obj.likedByUser = !!(await likedByUser);

  return res.json({ article: obj });
}

async function getRedis(req, res, next) {
  const articleId = req.article['_id'];
  const userId = req.user ? req.user['_id'] : '';
  const keyLBU = `likedByUser:${articleId}.${userId}`;
  const keyLikes = `likes:${articleId}`;
  const dataLBU = await redis.getAsync(keyLBU);
  const dataLikes = await redis.getAsync(keyLikes);

  const obj = req.article;

  // cache hit
  if (dataLBU) {
    obj.likedByUser = JSON.parse(dataLBU);

    // cache miss
  } else {
    // acquire lock
    const lock = await redis.redlock
      .lock(`locks:${keyLBU}`, redis.ttl)
      .catch(e => {
        // retry cache lookup if failed to acquire lock
        setTimeout(getRedis(req, res, next), 200);
        return;
      });

    if (!lock) return;

    // Check if article has been liked by current user
    const likedByUser = await Like.findOne({
      article: req.article,
      user: req.user,
    }).catch(e => next(e));

    // update cache
    await redis.setAsync(keyLBU, JSON.stringify(!!likedByUser));

    // append field
    obj.likedByUser = !!likedByUser;

    // release lock
    lock.unlock().catch(e => {
      // we weren't able to reach redis; your lock will eventually
      // expire, but you probably want to log this error
      console.error('unable to unlock: ', e); //eslint-disable-line no-console
    });
  }

  if (dataLikes) {
    obj.likes = JSON.parse(dataLikes);
  } else {
    // acquire lock
    const lock = await redis.redlock
      .lock(`locks:${keyLikes}`, redis.ttl)
      .catch(() => {
        // retry cache lookup if failed to acquire lock
        setTimeout(getRedis(req, res, next), 200);
        return;
      });
    if (!lock) return;

    // Get total number of likes for the article
    const likes = await Like.getByArticle(articleId).catch(e => next(e));
    // update cache
    await redis.setAsync(keyLikes, JSON.stringify(likes));

    // append field
    obj.likes = likes;
    // release lock
    lock.unlock().catch(e => {
      // we weren't able to reach redis; your lock will eventually
      // expire, but you probably want to log this error
      console.error('unable to unlock: ', e); //eslint-disable-line no-console
    });
  }

  return res.json({ article: obj });
}

/**
 * Create new article
 * @property  {string}  title       - Website title
 * @property  {string}  uri         - Website uri
 * @property  {string}  github      - GitHub repo
 * @property  {string}  description - Website description
 * @property  {File}    image       - Website screenshot
 *
 */
async function create(req, res, next) {
  const { file } = req;

  const key = new Promise(resolve => {
    if (!file) {
      // const error = new APIError('Invalid image file!', httpStatus.BAD_REQUEST);
      // next(error);

      // NOTE: No screenshot OK for now
      resolve('');
    } else {
      const timestamp = Date.now().toString();
      uploadFile(file.buffer, `screenshots/${timestamp}-lg.png`, file.mimetype)
        .then(data => {
          resolve(data.Location);
        })
        .catch(e => next(e));
    }
  });

  const article = new Article({
    title: req.body.title,
    uri: req.body.uri,
    github: req.body.github,
    description: req.body.description,
    image: await key,
    tags: req.body.tags,
  });

  article
    .save()
    .then(savedArticle =>
      res.status(httpStatus.CREATED).json({ article: savedArticle }),
    )
    .catch(e => next(e));
}

/**
 * Search articles with the given query
 *
 * @param   {string}  req.query.q       - Query string
 * @param   {number}  req.query.offset  - Query offset
 *
 * @returns {object}                    -  ES search result
 */
async function search(req, res, next) {
  const { q, offset } = req.query;
  queryTerm(q, offset)
    .then(results => {
      res.json(results);
    })
    .catch(e => next(e));
}

/**
 * Get all articles
 *
 * @param   {number}  req.query.offset  - Articles offset
 *
 * @returns {object}                    - ES search result
 */
async function all(req, res, next) {
  const { offset } = req.query;
  queryAll(offset)
    .then(results => {
      res.json(results);
    })
    .catch(e => next(e));
}

module.exports = { load, get, create, parse, search, all, getRedis, loadRedis };
