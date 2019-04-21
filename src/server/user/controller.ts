import {NextFunction, Request, Response} from 'express';
import {CREATED} from 'http-status';

import {checkError} from '../../util/mq';
import {exchange} from '../amqp';

const DB_REQ = 'db.req';

/**
 * Load user and append to req
 */
async function load(
    req: Request, res: Response, next: NextFunction, id: string) {
  const query = {_id: id};
  exchange.rpc(query, `${DB_REQ}.user.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => (req.user = content.doc))
      .then(() => next())
      .catch(next);
}

/**
 * Get user
 * @property  {User}  req.user  - User object
 * @returns   {User}
 */
function get(req: Request, res: Response) {
  return res.json({user: req.user});
}

/**
 * Get a list of users
 */
function list(req: Request, res: Response, next: NextFunction) {}

/**
 * Create new user
 * @property  {string}  req.body.username - Username
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 *
 */
async function create(req: Request, res: Response, next: NextFunction) {
  const user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  exchange.rpc(user, `${DB_REQ}.user.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => res.status(CREATED).json({user: content.doc}))
      .catch(next);
}

async function update(req: Request, res: Response, next: NextFunction) {}

async function remove(req: Request, res: Response, next: NextFunction) {}

export {load, get, create, update, remove};
