const amqp = require('./AMQPClient');
const AMQP_URL = 'amqp://rabbitmq:5672';
let mqClient = null;

async function init() {
  mqClient = new amqp(AMQP_URL);
  await mqClient.initialize();

  const promises = [
    /** article */
    mqClient.bindExchange('api', 'db', 'db.res.article.get'),
    mqClient.bindExchange('api', 'db', 'db.res.article.create'),
    mqClient.bindExchange('api', 'db', 'db.res.article.update'),
    mqClient.bindExchange('api', 'db', 'db.res.article.delete'),
    mqClient.createWorker('db.res.article.get', 'api', 'db.res.article.get'),
    mqClient.createWorker(
      'db.res.article.create',
      'api',
      'db.res.article.create',
    ),
    mqClient.createWorker(
      'db.res.article.update',
      'api',
      'db.res.article.update',
    ),
    mqClient.createWorker(
      'db.res.article.delete',
      'api',
      'db.res.article.delete',
    ),

    /** auth */
    mqClient.bindExchange('api', 'db', 'db.res.auth.create'),
    mqClient.createWorker('db.res.auth.create', 'api', 'db.res.auth.create'),

    /** comment */
    mqClient.bindExchange('api', 'db', 'db.res.comment.get'),
    mqClient.bindExchange('api', 'db', 'db.res.comment.create'),
    mqClient.bindExchange('api', 'db', 'db.res.comment.update'),
    mqClient.bindExchange('api', 'db', 'db.res.comment.delete'),
    mqClient.createWorker('db.res.comment.get', 'api', 'db.res.comment.get'),
    mqClient.createWorker(
      'db.res.comment.create',
      'api',
      'db.res.comment.create',
    ),
    mqClient.createWorker(
      'db.res.comment.update',
      'api',
      'db.res.comment.update',
    ),
    mqClient.createWorker(
      'db.res.comment.delete',
      'api',
      'db.res.comment.delete',
    ),

    /** like */
    mqClient.bindExchange('api', 'db', 'db.res.like.get'),
    mqClient.bindExchange('api', 'db', 'db.res.like.create'),
    mqClient.bindExchange('api', 'db', 'db.res.like.update'),
    mqClient.bindExchange('api', 'db', 'db.res.like.delete'),
    mqClient.createWorker('db.res.like.get', 'api', 'db.res.like.get'),
    mqClient.createWorker('db.res.like.create', 'api', 'db.res.like.create'),
    mqClient.createWorker('db.res.like.update', 'api', 'db.res.like.update'),
    mqClient.createWorker('db.res.like.delete', 'api', 'db.res.like.delete'),

    /** user */
    mqClient.bindExchange('api', 'db', 'db.res.user.get'),
    mqClient.bindExchange('api', 'db', 'db.res.user.create'),
    mqClient.bindExchange('api', 'db', 'db.res.user.update'),
    mqClient.bindExchange('api', 'db', 'db.res.user.delete'),
    mqClient.createWorker('db.res.user.get', 'api', 'db.res.user.get'),
    mqClient.createWorker('db.res.user.create', 'api', 'db.res.user.create'),
    mqClient.createWorker('db.res.user.update', 'api', 'db.res.user.update'),
    mqClient.createWorker('db.res.user.delete', 'api', 'db.res.user.delete'),
  ];
  await Promise.all(promises);
}

init();

module.exports = mqClient;
