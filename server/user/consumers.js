const { memCache } = require('../../system/cache');
const { msgToDoc, docToMsg, checkError } = require('../../util/mq');

const EXCHANGE = 'db';
const PATTERN = 'db.res.user';

/**
 * Initializes the mongo consumers.
 * @param   {MongoClient} mongoClient - MongoClient instance
 * @param   {AMQPClient}  mqClient    - AMQPClient instance
 * @returns {object}                  - Consumer functions
 */
module.exports = function(mqClient) {
  /**
   * Consumer function for create events. Inserts a new document into the
   * mongodb.
   * @param   {object}  msg - Rabbitmq message
   * @returns {Promise}
   */
  function create(msg) {
    return new Promise(async (resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const user = obj.doc;
      const key = `__express__/api/user/${user['_id']}`;

      // FOR NOW ASSUME NO ERRORS
      memCache.put(key, { user }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * Consumer function for get events. Gets the document that matches the
   * provided query.
   * @param   {object}  msg - Rabbitmq message
   * @returns {Promise}
   */
  function get(msg) {
    return new Promise(async (resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const query = obj.query;
      const user = obj.doc;
      const key = `__express__/api/user/${query['_id']}`;

      // ASSUME NO ERRORS
      memCache.put(key, { user }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * Consumer function for list events. Gets the documents that match the
   * provided query.
   * @param   {object}  msg - Rabbitmq message
   * @returns {Promise}
   */
  function list(msg) {
    return new Promise(async (resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const query = obj.query;
      const users = obj.docs;
      const key = `__express__/api/user/?`;

      // ASSUME NO ERRORS
      memCache.put(key, { user }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * Consumer function for update events.
   * @param   {object}  msg - Rabbitmq message
   * @returns {Promise}
   */
  function update(msg) {
    return new Promise((resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const user = obj.doc;
      const key = `__express__/api/user/${user['_id']}`;

      // ASUME NO ERRORS
      memCache.put(key, { user }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * Consumer function for delete events.
   * @param   {object}  msg - Rabbitmq message
   * @returns {Promise}
   */
  function remove(msg) {
    return new Promise((resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const user = obj.doc;
      const key = `__express__/api/user/${user['_id']}`;

      // ASUME NO ERRORS
      memCache.put(key, { user }, 10 * 1000);
      resolve(true);
    });
  }

  return { create, get, list, update, remove };
};
