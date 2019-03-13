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

module.exports = { checkError };
