const amqp = require('./AMQPClient');
const AMQP_URL = 'amqp://rabbitmq:5672';

let mqClient = null;

async function init() {
  mqClient = new amqp(AMQP_URL);

  mqClient
    .initialize()
    .then(() => [
      mqClient.bindExchange('api', 'db', 'db.res.#.#'),
      mqClient.createWorker('db.res', 'api', 'db.res.#.#'),
    ])
    .then(promises => Promise.all(promises))
    .then(() => Object.freeze(mqClient))
    .catch(err => console.error(`[AMQP] ${err.message}`));
}

init();

module.exports = mqClient;
