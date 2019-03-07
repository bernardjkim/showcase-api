const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');
const { memCache, lookup } = require('../../system/cache');
const { checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

/**
 * Get likes
 * @property  {Like[]}  req.likes - Number of likes for article
 * @returns   {Like[]}            - Object containing article id and number of likes
 */
async function get(req, res, next) {
  const key = `like.id:${req.params.like}`;
  let like = memCache.get(key);

  // hit
  if (like) return res.json(like);

  // miss
  const query = { _id: req.params.like };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.like.get').catch(next);
  like = await lookup(key);

  return res.json(like);
}

/**
 * TODO
 */
async function list(req, res, next) {
  const { article, user } = req.query;
  const key = `likes.article:${article}.user:${user}`;
  let likes = memCache.get(key);

  // hit
  if (likes) {
    const likeList = [];
    likes.forEach(like => {
      likeList.push(memCache.get(`like.id:${like}`));
    });
    return res.json(likeList);
  }

  // miss
  const query = { article, user };
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.like.list').catch(next);
  likes = await lookup(key);

  return res.json(likes);
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
  mqClient.publish(docToMsg(like), EXCHANGE, 'db.req.like.create').catch(next);
}

/**
 * TODO:
 */
async function update(req, res, next) {
  const query = {};
  const like = {};
  mqClient.publish(docToMsg({ query, like }), EXCHANGE, 'db.req.like.update').catch(next);
}

/**
 * TODO:
 */
async function remove(req, res, next) {
  const query = {};
  mqClient.publish(docToMsg(query), EXCHANGE, 'db.req.like.delete').catch(next);
}

module.exports = { get, list, create, update, remove };
