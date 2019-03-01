const httpStatus = require('http-status');
const Like = require('./like.model');

const Article = require('../article/article.model');
const APIError = require('../error/APIError');
const amqp = require('../../system/amqp');
const AMQP_URL = 'amqp://rabbitmq:5672';
let mqClient = null;

async function init() {
  mqClient = new amqp(AMQP_URL);
  await mqClient.initialize();
  await mqClient.createWorker(
    'likes-create-success-queue',
    'likes',
    'likes.event.create.success',
  );
  await mqClient.createWorker(
    'likes-get-success-queue',
    'likes',
    'likes.event.get.success',
  );
}
/**
 * Load number of likes and append to req
 */
async function load(req, res, next, id) {
  const query = { article: id };

  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'likes', 'likes.event.get')
    .then(doc => (req.likes = JSON.parse(doc.toString())))
    .then(next)
    .catch(next);
}

/**
 * Get likes
 * @property  {string}  req.articleId - Article ID
 * @property  {number}  req.likes     - Number of likes for article
 * @returns   {object}                - Object containing article id and number of likes
 */
function get(req, res) {
  return res.json({ likes: req.likes });
}

/**
 * Create new like
 * @property  {string}  req.body.articleId  - Article id
 * @property  {User}    req.user            - User object
 */
async function create(req, res, next) {
  const like = {
    article: req.body.articleId,
    user: req.user['_id'],
  };
  mqClient
    .publish(Buffer.from(JSON.stringify(like)), 'likes', 'likes.event.create')
    .then(doc => res.json({ like: JSON.parse(doc.toString()) }))
    .catch(next);
}

async function update(req, res, next) {
  const query = {};
  const like = {};
  mqClient
    .publish(
      Buffer.from(
        JSON.stringify({ query, like }),
        'likes',
        'likes.event.update',
      ),
    )
    .then(doc => res.json({ like: JSON.parse(doc.toString()) }));
}

async function remove(req, res, next) {
  const query = {};
  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'likes', 'likes.event.delete')
    .then(doc => res.json({ like: JSON.parse(doc.toString()) }));
}

module.exports = { load, get, create, update, remove, init };
