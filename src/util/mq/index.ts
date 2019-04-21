import { BAD_REQUEST } from 'http-status';
import { APIError } from '../../server/error/APIError';

/**
 * If doc contains an error throw an APIError
 * @param {object} doc - Response document
 */
function checkError(doc: Content) {
  const error = doc.error;
  if (error) throw new APIError(error.message, BAD_REQUEST);
  else return doc;
}

interface Content {
  error: { message: string };
  doc: any;
  docs: any;
}

export { checkError };
