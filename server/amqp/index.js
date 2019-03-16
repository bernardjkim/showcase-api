const amqp = require('@bernardjkim/amqplib');
const config = require('../../config/config');

const { host, port } = config.rabbit;
const mqClient = new amqp.Connection(`amqp://${host}:${port}`);
const exchange = mqClient.declareExchange('api', 'topic');

module.exports = { mqClient, exchange };
