const qs = require('qs');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const Article = require('./article.model');
const Like = require('../like/like.model');
const { queryTerm, queryAll } = require('../../util/elasticsearch');

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
 * @param   {string}  req.query.q  - Query string
 *
 * @returns {object}               -  ES search result
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
 * @returns {object}  -  ES search result
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
