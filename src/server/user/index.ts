import { Router } from 'express';

// import paramValidation from '../../config/param-validation';
import * as auth from '../auth/controller';
// import { validate } from '../joi';

import { create, get, load } from './controller';

const router = Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/user - Get list of users */
  // .get( user.list)

  /** POST /api/user - Create new user */
  .post(create);

router
  .route('/current')

  /** GET /api/user/current - Get current user */
  .get(auth.parse, get);

router
  .route('/:user')

  /** GET /api/user/:user - Get user */
  .get(get);

/** Load user when API with id route parameter is hit */
router.param('user', load);

export { router };
