import {NextFunction, Request, Response} from 'express';
import {NO_CONTENT, UNAUTHORIZED} from 'http-status';
import {decode, sign} from '../../util/jwt';
import {checkError} from '../../util/mq';
import {exchange} from '../amqp';
import {APIError} from '../error/APIError';
const DB_REQ = 'db.req';

/**
 * Returns jwt token if valid email and password is provided
 *
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 */
async function create(req: Request, res: Response, next: NextFunction) {
  const {email, password} = req.body;
  const options = {
    // maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true,  // The cookie only accessible by the web server
    signed: true,    // Indicates if the cookie should be signed
  };

  const auth = {email, password};
  exchange.rpc(auth, `${DB_REQ}.auth.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => sign({user: content.doc}))
      .then(token => res.cookie('jwt', token, options))
      .then(() => res.status(NO_CONTENT))
      .then(() => res.send())
      .catch(next);
}

/**
 * Clears jwt cookie
 */
function remove(req: Request, res: Response) {
  res.clearCookie('jwt').status(NO_CONTENT).send();
}

// TODO: handle expired tokens
/**
 * Decode JWT and append user to req
 */
async function parse(req: Request, res: Response, next: NextFunction) {
  const token = req.signedCookies.jwt;
  if (!token) return next();

  // decode jwt
  const decoded = await decode(token).catch(e => next(e));
  if (!decoded) return next();
  // const {iat, exp} = decoded;

  req.user = decoded.user;
  next();
}

/**
 * Verify that the JWT was parsed and user was appeneded to req
 */
function authenticate(req: Request, res: Response, next: NextFunction) {
  if (req.user) return next();
  const error = new APIError('Unauthorized', UNAUTHORIZED);
  return next(error);
}

export {authenticate, create, parse, remove};
