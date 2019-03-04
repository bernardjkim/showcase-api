const qs = require('qs');
const httpStatus = require('http-status');
const APIError = require('../error/APIError');
const { queryTerm, queryAll } = require('../../util/elasticsearch');
const { uploadFile } = require('../../util/s3');
const mqClient = require('../../system/amqp');

/**
 * Load article and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'api', 'db.req.article.get')
    .then(reply => {
      const doc = JSON.parse(reply.toString());
      if (doc.error)
        return next(new APIError(doc.error.message), httpStatus.BAD_REQUEST);
      req.article = doc.articles[0];
      next();
    })
    .catch(next);
}

/**
 * Parse the form and append to req.
 * This step is necessary because the form is received as a stringified object.
 * @property  {string}  req.body.form - Stringified form data
 */
function parse(req, res, next) {
  // parse form and append to req object
  req.form = qs.parse(req.body.form);
  next();
}

/**
 * Get article
 * @param   {Article} req.article   - Requested Article
 * @returns {Article}
 */
function get(req, res) {
  return res.json({ article: req.article });
}

/**
 * Create new article
 * @property  {object}  req.form  - Website information
 * @property  {object}  req.file  - Website screenshot
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

  const article = {
    ...form,
    image: await imageLocation,
  };

  mqClient
    .publish(
      Buffer.from(JSON.stringify(article)),
      'api',
      'db.req.article.create',
    )
    .then(reply => {
      const doc = JSON.parse(reply.toString());
      if (doc.err)
        return next(new APIError(doc.error.message), httpStatus.BAD_REQUEST);
      res.status(httpStatus.CREATED).json({ article: doc.article });
    })
    .catch(next);
}

/**
 * Search articles with the given query
 * @param   {string}  req.query.q       - Query string
 * @param   {number}  req.query.offset  - Query offset
 * @returns {object}                    -  ES search result
 */
async function search(req, res, next) {
  const { q, offset } = req.query;
  const results = await queryTerm(q, offset).catch(e => next(e));
  res.json(results);
}

/**
 * Get all articles
 * @param   {number}  req.query.offset  - Articles offset
 * @returns {object}                    - ES search result
 */
async function all(req, res, next) {
  const { offset } = req.query;
  const results = await queryAll(offset).catch(e => next(e));
  res.json(results);
}

module.exports = { load, get, create, parse, search, all };
