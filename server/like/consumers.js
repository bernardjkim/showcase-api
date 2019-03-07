const SHA256 = require('crypto-js/sha256');
const { memCache } = require('../../system/cache');
const { msgToDoc, docToMsg, checkError } = require('../../util/mq');

const EXCHANGE = 'db';
const PATTERN = 'db.res.like';

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
      const like = obj.doc;
      // cache individual like
      const key = `like.id:${query['_id']}`;
      memCache.put(key, { like }, 60 * 1000);

      // cache set references
      const setKey = `likes.article:${query['article']}.user:${query['user']}`;
      const refs = memCache.get(setKey);
      refs.add(like['_id']);
      memCache.put(refs, refs, 60 * 1000);
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
      const like = obj.doc;
      const key = `like.id:${query['_id']}`;

      // ASSUME NO ERRORS
      memCache.put(key, { like }, 60 * 1000);
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
      const likes = obj.docs;
      const refs = new Set();

      // cache individual likes
      likes.forEach(like => {
        const key = `like.id:${like['_id']}`;
        refs.add(like['_id']);
        memCache.put(key, like, 60 * 1000);
      });

      // cache list of references
      const key = `likes.article:${query['article']}.user:${query['user']}`;
      memCache.put(key, refs, 60 * 1000);

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
      const like = obj.doc;
      const key = `__express__/api/like/${like['_id']}`;

      // ASUME NO ERRORS
      memCache.put(key, { like }, 60 * 1000);
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
      const like = obj.doc;
      const key = `__express__/api/like/${like['_id']}`;

      // ASUME NO ERRORS
      memCache.put(key, { like }, 60 * 1000);
      resolve(true);
    });
  }

  return { create, get, list, update, remove };
};
