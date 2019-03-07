const { memCache } = require('../../system/cache');
const { msgToDoc, docToMsg, checkError } = require('../../util/mq');

const EXCHANGE = 'db';
const PATTERN = 'db.res.article';

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
      const article = obj.doc;
      const key = `__express__/api/article/${article['_id']}`;

      // FOR NOW ASSUME NO ERRORS
      memCache.put(key, { article }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * Consumer function for get events. Gets the documents that match the
   * provided query.
   * @param   {object} msg - Rabbitmq message
   * @returns {Promise}
   */
  function get(msg) {
    return new Promise(async (resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const query = obj.query;
      const article = obj.doc;
      const key = `__express__/api/article/${query['_id']}`;

      // ASSUME NO ERRORS
      memCache.put(key, { article }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * TODO
   */
  function list(msg) {
    return new Promise(async (resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const query = obj.query;
      const articles = obj.docs;
      const key = `__express__/api/article/?term=${query.term}&offset=${query.offset}`;

      // ASSUME NO ERRORS
      memCache.put(key, { articles }, 10 * 1000);
      resolve(true);
    });
  }

  /**
   * Consumer function for update events.
   * @param   {object}  msg - Rabbitmq message
   * @returns {Promise}
   *
   */
  function update(msg) {
    return new Promise((resolve, reject) => {
      const { content, properties } = msg;
      const { correlationId } = properties;
      const obj = msgToDoc(content);
      const article = obj.doc;
      const key = `__express__/api/article/${article['_id']}`;

      // ASUME NO ERRORS
      memCache.put(key, { article }, 10 * 1000);
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
      const article = obj.doc;
      const key = `__express__/api/article/${article['_id']}`;

      // ASUME NO ERRORS
      memCache.put(key, { article }, 10 * 1000);
      resolve(true);
    });
  }

  return { create, get, list, update, remove };
};
