const mqClient = require('../../system/amqp');
const { rpc, checkError, docToMsg, msgToDoc } = require('../../util/mq');
const EXCHANGE = 'api';

function get(query) {
  const msg = docToMsg(query);
  return mqClient
    .publish(msg, EXCHANGE, 'db.req.like.get')
    .then(msgToDoc)
    .then(checkError);
}

function create(like) {
  const msg = docToMsg(like);
  return mqClient
    .publish(msg, EXCHANGE, 'db.req.like.create')
    .then(msgToDoc)
    .then(checkError);
}

function update(query, like) {
  const msg = docToMsg({ query, like });
  return mqClient
    .publish(msg, EXCHANGE, 'db.req.like.update')
    .then(msgToDoc)
    .then(checkError);
}

function remove(query) {
  const msg = docToMsg(query);
  return mqClient
    .publish(msg, EXCHANGE, 'db.req.like.delete')
    .then(msgToDoc)
    .then(checkError);
}

module.exports = { get, create, update, remove };
