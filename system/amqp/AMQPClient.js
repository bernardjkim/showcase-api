const EventEmitter = require('events');
const amqp = require('amqplib');
const uuid = require('uuid/v1');

/**
 * AMQPClient is used to interface with a connected message broker. The class
 * provideds methods to publish messages to an exchange and to attach consumers
 * to a message queue.
 */
class AMQPClient {
  constructor(url) {
    this.url = url;
    this.conn = null;
    this.ch = null;
    this.closingOrClosed = false;
  }

  /**
   * Initializes mq connection.
   * @returns {Promise}
   */
  initialize() {
    return new Promise(async resolve => {
      try {
        // create connection
        this.conn = await this._createConnection();
        if (!this.conn) return;

        // create channel
        this.ch = await this._createChannel();
        if (!this.ch) return;
      } catch (err) {
        this._handleError(err);
        return;
      }

      // log and resolve
      this.closingOrClosed = false;
      console.log('[AMQP] connected');
      resolve();
    });
  }

  /**
   * Publishes the message to an exchange. Closes the mq connection on error.
   * @param {Buffer} content    - Message content
   * @param {string} exchange   - Exchange name
   * @param {string} routingKey - Routing key
   */
  publish(content, exchange, routingKey, options = { persistent: true }) {
    //TODO: validate params
    const correlationId = uuid();
    return new Promise(resolve => {
      this.ch.responseEmitter.once(correlationId, resolve);
      this.ch.publish(exchange, routingKey, content, {
        ...options,
        correlationId,
      });
    });
  }

  /**
   * Create a worker process listening for messages for the specified
   * queue/exchange/pattern.
   * @param   {string}    queue     - Queue name
   * @param   {string}    exchange  - Exchange binding
   * @param   {string}    pattern   - Routing key pattern
   * @returns {Promise}
   */
  createWorker(queue, exchange, pattern, options = { noAck: true }) {
    const processMsg = msg => {
      this.ch.responseEmitter.emit(msg.properties.correlationId, msg.content);
    };

    return Promise.all([
      this.ch.assertQueue(queue),
      this.ch.assertExchange(exchange),
      this.ch.bindQueue(queue, exchange, pattern),
      this.ch.consume(queue, processMsg, options),
    ])
      .then(() =>
        console.log(`[AMQP] Worker started: ${queue} ${exchange} ${pattern}`),
      )
      .catch(err => this._handleError(err));
  }

  bindExchange(destination, source, pattern) {
    return Promise.all([
      this.ch.assertExchange(destination),
      this.ch.assertExchange(source),
      this.ch.bindExchange(destination, source, pattern),
    ])
      .then(() =>
        console.log(`[AMQP] ${destination} bound to ${source} on ${pattern}`),
      )
      .catch(err => this._handleError(err));
  }

  //============================================================================
  //  Private
  //============================================================================

  /**
   * Initializes the connection object
   * @param   {object}  conn  - AMQP connection object
   * @returns {Promise}       - Initialized AMQP connection object
   */
  async _createConnection() {
    return new Promise((resolve, reject) => {
      amqp
        .connect(`${this.url}?heartbeat=60`)
        .then(conn => {
          conn.on('error', _err => reject(new Error('connection error')));
          conn.on('close', () => reject(new Error('conneciton close')));
          resolve(conn);
        })
        .catch(_err => reject(new Error('connection fail')));
    });
  }

  /**
   * Initializes the channel object
   * @param   {object}  ch  - AMQP channel object
   * @returns {Promise}     - Initialized AMQP channel object
   */
  async _createChannel() {
    return new Promise((resolve, reject) => {
      this.conn
        .createConfirmChannel()
        .then(ch => {
          ch.responseEmitter = new EventEmitter();
          ch.responseEmitter.setMaxListeners(0);
          ch.on('error', _err => reject(new Error('channel error')));
          ch.on('close', () => reject(new Error('channel close')));
          resolve(ch);
        })
        .catch(_err => reject(new Error('channel fail')));
    });
  }

  /**
   * Returns a new function that takes in a msg and acknowledges the msg on
   * success and rejects the msg on failure.
   * @param   {Function}  handler - Handler function
   * @param   {Buffer}    msg     - Rabbitmq message
   * @returns {Function}          - New function that handles the msg then sends ack
   */
  _processMsg(handler) {
    return msg => {
      handler(msg)
        .then(ok => this._ackMsg(ok, msg))
        .catch(err => this._handleError(err));
    };
  }

  /**
   * Acknowledge that the message was handled
   * @param {boolean} ok  - True if message was handled
   * @param {Buffer}  msg - Message that was hanndled
   */
  _ackMsg(ok, msg) {
    try {
      if (ok) this.ch.ack(msg);
      else this.ch.reject(msg, true);
    } catch (err) {
      this._handleError(err);
    }
  }

  /**
   * Handle all AMQP errors
   * @param {Error} err - Handle AMQP errors
   */
  _handleError(err) {
    // log error
    console.error(`[AMQP] ERROR: ${err.message}`);

    // handle error
    switch (err.message) {
      case 'connection fail':
      case 'connection close':
        setTimeout(() => this.initialize(), 5000);
        break;

      case 'channel fail':
      case 'publish error':
        this._closeConnection();
        break;
      default:
        break;
    }
  }

  /**
   * Close connection. Ignore if connection is already closing or is already
   * closed.
   */
  _closeConnection() {
    if (!this.closingOrClosed) {
      this.closingOrClosed = true;
      this.conn = null;
      this.ch = null;
      this.conn.close();
    }
  }
}

module.exports = AMQPClient;
