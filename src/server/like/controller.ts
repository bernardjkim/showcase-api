import {NextFunction, Request, Response} from 'express';
import {CREATED} from 'http-status';

import {checkError} from '../../util/mq';
import {exchange} from '../amqp';

const DB_REQ = 'db.req';

/**
 * Load specified like
 */
async function load(
    req: Request, res: Response, next: NextFunction, id: string) {
  const query = {_id: id};
  exchange.rpc(query, `${DB_REQ}.like.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => (req.like = content.doc))
      .then(() => next())
      .catch(next);
}

/**
 * Get like
 * @property  {Like}  req.like  - Like object
 * @returns   {Like}            - Like object
 */
function get(req: Request, res: Response) {
  return res.json({like: req.like});
}

/**
 * TODO
 */
function list(req: Request, res: Response, next: NextFunction) {
  const {article, user} = req.query;
  const query = {article, user};
  exchange.rpc(query, `${DB_REQ}.like.list`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => res.json({likes: content.docs}))
      .catch(next);
}

/**
 * Create new like
 * @property  {string}  req.body.articleId  - Article id
 * @property  {User}    req.user            - User object
 */
async function create(req: Request, res: Response, next: NextFunction) {
  const like = {
    article: req.body.articleId,
    user: req.user._id,
  };
  exchange.rpc(like, `${DB_REQ}.like.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => res.status(CREATED).json({like: content.doc}))
      .catch(next);
}

/**
 * TODO:
 */
async function update(req: Request, res: Response, next: NextFunction) {}

/**
 * TODO:
 */
async function remove(req: Request, res: Response, next: NextFunction) {}

export {load, get, list, create, update, remove};
