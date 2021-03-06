const qs = require('qs');
const httpStatus = require('http-status');
const { exchange } = require('../amqp');
const { checkError } = require('../../util/mq');
const DB_REQ = 'db.req';
const ES_REQ = 'es.req';

/**
 * Load article and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  exchange
    .rpc(query, `${DB_REQ}.article.get`)
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => (req.article = content.doc))
    .then(() => next())
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

  const article = {
    form,
    file,
  };
  // create new article
  exchange
    .rpc(article, `${DB_REQ}.article.create`)
    .then(msg => msg.getContent())
    .then(checkError)
    .then(content => res.status(httpStatus.CREATED).json(content.doc))
    .catch(next);
}

/**
 * Search articles with the given query
 * @param   {string}  req.query.term    - Query string
 * @param   {number}  req.query.offset  - Query offset
 * @param   {string}  req.query.sort    - Query offset
 * @returns {object}                    -  ES search result
 */
async function search(req, res, next) {
  const { term, offset,sort } = req.query;
  exchange
    .rpc({ term, offset, sort }, `${ES_REQ}.article.search`)
    // .rpc({ term: q, offset }, `cache.req.article.search`)
    .then(msg => msg.getContent())
    .then(checkError)
    .then(result => res.json(result.docs))
    .catch(next);
}

/**
 * Get all articles
 * @param   {number}  req.query.offset  - Articles offset
 * @param   {string}  req.query.sort    - Query offset
 * @returns {object}                    - ES search result
 */
async function all(req, res, next) {
  const { term, offset } = req.query;
  exchange
    .rpc({ term, offset }, `${ES_REQ}.article.search`)
    // .rpc({ term, offset }, `cache.req.article.search`)
    .then(msg => msg.getContent())
    .then(checkError)
    .then(result => res.json(result.docs))
    .catch(next);
}

module.exports = { load, get, create, parse, search, all };
