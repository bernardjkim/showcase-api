const qs = require('qs');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const Article = require('./article.model');
const Like = require('../like/like.model');
const { queryTerm, queryAll } = require('../../util/elasticsearch');
const redis = require('../../util/redis');

const { uploadFile } = require('../../util/s3');

/** ---------------------------------UTIL------------------------------------ */

/**
 * Get the article with the provided id
 *
 * @param {string}    id    - Article id
 * @param {function}  func  - Function used to fetch the desired resource
 */
function getResource(key, func) {
  return new Promise(async (resolve, reject) => {
    const data = await redis.getAsync(key);

    // cache hit
    if (data) {
      resolve(JSON.parse(data));
      return;
    }

    // acquire lock
    const lock = await redis.redlock
      .lock(`locks:${key}`, redis.ttl)
      .catch(() => {
        // unable to acquire lock
        setTimeout(resolve(null), 200);
        return;
      });
    // not sure why, but lock will return undefined sometimes???
    if (!lock) throw new Error('Redis lock is undefined!!!');

    // fetch resource
    const result = await func().catch(e => {
      reject(e);
      return;
    });

    // update cache with resource
    await redis.setAsync(key, JSON.stringify(result));

    // release lock
    lock.unlock().catch(e => {
      // we weren't able to reach redis; your lock will eventually
      // expire, but you probably want to log this error
      console.error('unable to unlock: ', e); //eslint-disable-line no-console
    });
    resolve(result);
  });
}

/**
 * Create/update the cached value for the given key
 *
 * @param {string} key  - Resource key
 * @param {string} func - Function to create resource
 */
function createResource(key, func) {
  return new Promise(async (resolve, reject) => {
    // acquire lock
    const lock = await redis.redlock
      .lock(`locks:${key}`, redis.ttl)
      .catch(() => {
        // unable to acquire lock
        setTimeout(resolve(null), 200);
        return;
      });
    // not sure why, but lock will return undefined sometimes???
    if (!lock) throw new Error('Redis lock is undefined!!!');

    // delete old value
    await redis.delAsync(key).catch(e => {
      reject(e);
      return;
    });

    // create resource
    const result = await func().catch(e => {
      reject(e);
      return;
    });

    // update cache with resource
    await redis.setAsync(key, JSON.stringify(result)).catch(e => {
      reject(e);
      return;
    });

    // release lock
    lock.unlock().catch(e => {
      // we weren't able to reach redis; your lock will eventually
      // expire, but you probably want to log this error
      console.error('unable to unlock: ', e); //eslint-disable-line no-console
    });
    resolve(result);
  });
}

/** ------------------------------------------------------------------------- */
/**
 * Load article and append to req
 */
async function load(req, res, next, id) {
  const key = `article:${id}`;

  let result = null;
  while (result === null) {
    result = await getResource(
      key,
      () =>
        new Promise((resolve, reject) => {
          Article.get(id)
            .then(article => {
              resolve(article.toObject());
            })
            .catch(e => reject(e));
        }),
    ).catch(e => next(e));
  }

  // append article and continue to next
  req.article = result;
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
  const articleId = req.article['_id'];
  const userId = req.user ? req.user['_id'] : '';
  const keyLBU = `likedByUser:${articleId}.${userId}`;
  const keyLikes = `likes:${articleId}`;

  // is article liked by user?
  const likedByUser = new Promise(async resolve => {
    let result = null;
    while (result === null) {
      result = await getResource(
        keyLBU,
        () =>
          new Promise((resolve, reject) => {
            Like.findOne({
              article: req.article,
              user: req.user,
            })
              .then(like => resolve(!!like))
              .catch(e => reject(e));
          }),
      );
    }
    resolve(result);
  });

  // number of article likes
  const likes = new Promise(async resolve => {
    let result = null;
    while (result === null) {
      result = await getResource(keyLikes, () =>
        Like.getByArticle(articleId),
      ).catch(e => next(e));
    }
    resolve(result);
  });

  const obj = {
    ...req.article,
    likedByUser: await likedByUser,
    likes: await likes,
  };

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

  const imageLocation = new Promise(resolve => {
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
    image: await imageLocation,
    tags: req.body.tags,
  });
  const key = `article:${article['_id']}`;

  let result = null;
  while (result === null) {
    result = await createResource(
      key,
      () =>
        new Promise((resolve, reject) => {
          article
            .save()
            .then(savedArticle => resolve(savedArticle))
            .catch(e => reject(e));
        }),
    );
  }

  res.status(httpStatus.CREATED).json({ article: result });
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

module.exports = { load, get, create, parse, search, all };
