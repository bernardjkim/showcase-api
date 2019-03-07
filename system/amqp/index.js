const amqp = require('./AMQPClient');
const config = require('../../config/config');

let mqClient = null;

async function init() {
  mqClient = new amqp(`amqp://${config.rabbit.host}:${config.rabbit.port}`);

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
