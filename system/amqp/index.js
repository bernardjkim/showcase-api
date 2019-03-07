const amqp = require('./AMQPClient');
const config = require('../../config/config');
const article = require('../../server/article/consumers');
const user = require('../../server/user/consumers');
const comment = require('../../server/comment/consumers');
const like = require('../../server/like/consumers');

let mqClient = null;

async function init() {
  mqClient = new amqp(`amqp://${config.rabbit.host}:${config.rabbit.port}`);

  await mqClient.initialize();

  const articleConsumers = article(mqClient);
  const userConsumers = user(mqClient);
  const likeConsumers = like(mqClient);
  const commentConsumers = comment(mqClient);

  const promises = [
    mqClient.bindExchange('api', 'db', 'db.res.#.#'),
    mqClient.createWorker(articleConsumers.get, 'db.res.article.get', 'api', 'db.res.article.get'),
    mqClient.createWorker(userConsumers.get, 'db.res.user.get', 'api', 'db.res.user.get'),
    mqClient.createWorker(likeConsumers.get, 'db.res.like.get', 'api', 'db.res.like.get'),
    mqClient.createWorker(commentConsumers.get, 'db.res.comment.get', 'api', 'db.res.comment.get'),

    mqClient.createWorker(
      articleConsumers.list,
      'db.res.article.list',
      'api',
      'db.res.article.list',
    ),
    mqClient.createWorker(
      commentConsumers.list,
      'db.res.comment.list',
      'api',
      'db.res.comment.list',
    ),
    mqClient.createWorker(likeConsumers.list, 'db.res.like.list', 'api', 'db.res.like.list'),
    mqClient.createWorker(userConsumers.list, 'db.res.user.list', 'api', 'db.res.user.list'),
  ];

  Promise.all(promises)
    .then(() => Object.freeze(mqClient))
    .catch(err => console.error(`[AMQP] ${err.message}`));
}

init();

module.exports = mqClient;
