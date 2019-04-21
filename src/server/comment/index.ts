import { Router } from 'express';
import * as auth from '../auth/controller';
import { create, get, list, load } from './controller';

const router = Router(); // eslint-disable-line new-cap

router
  .route('/')
  /**
       GET /api/comment/?article=${article} - Get comments for specified
       article
     */
  .get(list)

  /** POST /api/comment - Create new comment */
  .post(auth.parse, auth.authenticate, create);

router
  .route('/:comment')

  /** GET /api/comment/:comment - Get specified comment */
  .get(get);

router.param('comment', load);

export { router };
