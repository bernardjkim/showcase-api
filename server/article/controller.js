const qs = require('qs');
const mqClient = require('../../system/amqp');
const httpStatus = require('http-status');
const { memCache } = require('../../system/cache');
const { uploadFile } = require('../../util/s3');
const { queryTerm, queryAll } = require('../../util/elasticsearch');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

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
function get(req, res, next) {
  const query = { _id: req.params.article };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.article.get').catch(next);
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
      .catch(next);
  });

  const article = {
    ...form,
    image: await imageLocation,
  };

  mqClient.publish(docToMsg(article), EXCHANGE, 'db.req.article.create').catch(next);
}

/**
 * Search articles with the given query
 * @param   {string}  req.query.q       - Query string
 * @param   {number}  req.query.offset  - Query offset
 * @returns {object}                    -  ES search result
 */
async function search(req, res, next) {
  const { q, offset } = req.query;
  const results = await queryTerm(q, offset).catch(next);
  const key = `__express__${req.originalUrl}`;
  memCache.put(key, results, 10 * 1000);
}

/**
 * Get all articles
 * @param   {number}  req.query.offset  - Articles offset
 * @returns {object}                    - ES search result
 */
async function all(req, res, next) {
  const { offset } = req.query;
  const results = await queryAll(offset).catch(next);
  const key = `__express__${req.originalUrl}`;
  memCache.put(key, results, 10 * 1000);
}

module.exports = { get, create, parse, search, all };
