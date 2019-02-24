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
 * Parse the form and append to req.
 * This step is necessary because the form is received as a stringified object.
 *
 * @property  {string}  req.body.form - Stringified form data
 */
function parse(req, res, next) {
  if (!req.body.form) {
    const error = new APIError('Missing form data', httpStatus.BAD_REQUEST);
    next(error);
    return;
  }

  // parse form and append to req object
  req.form = qs.parse(req.body.form);
  next();
}

/**
 * Get article
 * @param   {Article} req.article   - Requested Article
 *
 * @returns {Article}
 */
function get(req, res) {
  return res.json({ article: req.article });
}

/**
 * Create new article
 * @property  {object}  req.form  - Website information
 * @property  {object}  req.file  - Website screenshot
 *
 */
async function create(req, res, next) {
  const { file, form } = req;

  // upload screenshot to S3
  const imageLocation = new Promise(resolve => {
    const timestamp = Date.now().toString();
    uploadFile(file.buffer, `screenshots/${timestamp}-lg.png`, file.mimetype)
      .then(data => {
        resolve(data.Location);
      })
      .catch(e => next(e));
  });

  const article = new Article({ ...form, image: await imageLocation });

  // save article in database and send response
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
  const results = await queryTerm(q, offset).catch(e => next(e));
  res.json(results);
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
  const results = await queryAll(offset).catch(e => next(e));
  res.json(results);
}

module.exports = { load, get, create, parse, search, all };
