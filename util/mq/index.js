const mqClient = require('../../system/amqp');
const httpStatus = require('http-status');
const APIError = require('../../server/error/APIError');

/**
 * If doc contains an error throw an APIError
 * @param {object} doc - Response document
 */
function checkError(doc) {
  const error = doc.error;
  if (error) throw new APIError(error.message, httpStatus.BAD_REQUEST);
  else return doc;
}

/**
 * Convert the msg buffer into a JSON document
 * @param {Buffer} msg - Response msg recieved
 */
function msgToDoc(msg) {
  return JSON.parse(msg.toString());
}

/**
 * Convert the JSON document into a msg buffer
 * @param {object} doc - JSON document
 */
function docToMsg(doc) {
  return Buffer.from(JSON.stringify(doc));
}

module.exports = { checkError, msgToDoc, docToMsg };
