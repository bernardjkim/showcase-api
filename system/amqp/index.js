const amqp = require('amqplib/callback_api');
const AMQP_URL = 'amqp://rabbitmq:5672';

/** AMQP connection object */
let amqpConn = null;
/** AMQP channel object */
var pubChannel = null;

/**
 * Initializes rabbitmq service
 */
function init() {
  amqp.connect(`${AMQP_URL}?heartbeat=60`, function(err, conn) {
    if (err) {
      console.error('[AMQP]', err.message);
      return setTimeout(init, 1000);
    }

    conn.on('error', function(err) {
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message);
      }
    });

    conn.on('close', function() {
      console.error('[AMQP] reconnecting');
      return setTimeout(init, 1000);
    });

    console.log('[AMQP] connected');
    amqpConn = conn;
    createChannel();
  });
}

/**
 * Initialize channel
 */
function createChannel() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on('error', function(err) {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', function() {
      console.log('[AMQP] channel closed');
    });
    pubChannel = ch;
  });
}

/**
 * Publishes the message to an exchange.
 * @param {string} exchange   - Exchange name
 * @param {string} routingKey - Routing key
 * @param {Buffer} content    - Message content
 */
function publish(exchange, routingKey, content) {
  return new Promise((resolve, reject) => {
    try {
      pubChannel.publish(
        exchange,
        routingKey,
        content,
        { persistent: true },
        function(err, ok) {
          if (err) {
            console.error('[AMQP] publish', err);
            pubChannel.connection.close();
            reject(err);
          } else {
            resolve(ok);
          }
        },
      );
    } catch (e) {
      console.error('[AMQP] publish', e.message);
      reject(e);
    }
  });
}

/**
 * Close AMQP connection on error
 * @param   {Error}   err - AMQP error object
 * @returns {boolean}     - True if connection closed, false if no error
 */
function closeOnErr(err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  amqpConn.close();
  return true;
}

module.exports = { init, publish };
