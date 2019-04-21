import { Router } from 'express';

import * as auth from '../auth/controller';

import { create, get, list, load } from './controller';

const router = Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/like - Get likes for the specified article */
  .get(list)

  /** POST /api/like - Create new like */
  .post(auth.parse, auth.authenticate, create);

router
  .route('/:like')

  /** GET /api/like/:like - Get specified like */
  .get(get);

router.param('like', load);

export { router };
