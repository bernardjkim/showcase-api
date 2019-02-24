const qs = require('qs');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const Article = require('./article.model');
const { queryTerm, queryAll } = require('../../util/elasticsearch');

const { uploadFile } = require('../../util/s3');

/**
 * Load article and append to req
 */
async function load(req, res, next, id) {
  const result = await Article.get(id).catch(e => next(e));
  req.article = result.toObject();
  next();
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
 *
 * @returns {Article}
 */
async function get(req, res) {
  return res.json({ article: req.article });
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

  const savedArticle = await article.save().catch(e => next(e));
  res.status(httpStatus.CREATED).json({ article: savedArticle });
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
