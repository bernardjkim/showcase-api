const amqp = require('../../system/amqp');

const mqClient = new amqp.Connection();
const exchange = mqClient.declareExchange('api', 'topic');

module.exports = { mqClient, exchange };
