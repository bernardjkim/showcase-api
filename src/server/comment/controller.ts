import {NextFunction, Request, Response} from 'express';
import {CREATED} from 'http-status';
import {checkError} from '../../util/mq';
import {exchange} from '../amqp';
const DB_REQ = 'db.req';

/**
 * Load comments and append to req
 */
async function load(
    req: Request, res: Response, next: NextFunction, id: string) {
  const query = {_id: id};
  exchange.rpc(query, `${DB_REQ}.comment.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => (req.comment = content.doc))
      .then(() => next())
      .catch(next);
}

/**
 * Get comments
 * @property  {Comment[]} - Array of comments
 * @returns   {Comment[]}
 */
function get(req: Request, res: Response) {
  return res.json({comments: req.comments});
}

/**
 * TODO
 */
function list(req: Request, res: Response, next: NextFunction) {
  const {article, user} = req.query;
  const query = {article, user};
  exchange.rpc(query, `${DB_REQ}.comment.list`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => res.json({comments: content.docs}))
      .catch(next);
}

/**
 * Create new comment
 * @property  {string}  req.body.articleId  - Article id
 * @property  {string}  req.body.value      - Comment value
 * @property  {User}    req.user            - Posting user
 *
 */
async function create(req: Request, res: Response, next: NextFunction) {
  const comment = {
    article: req.body.articleId,
    user: req.user['_id'],
    value: req.body.value,
  };

  exchange.rpc(comment, `${DB_REQ}.comment.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => res.status(CREATED).json({comment: content.doc}))
      .catch(next);
}

/**
 * TODO
 */
function update() {}

/**
 * TODO
 */
function remove() {}

export {get, list, create, load, update, remove};
