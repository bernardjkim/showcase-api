import {Router} from 'express';
// import { validate } from '../joi';
// import paramValidation from '../../config/param-validation';
import {create, remove} from './controller';

const router = Router();

router
    .route('/')

    /** POST /api/auth - authenticate user */
    .post(create)

    /** DELETE /api/auth  - delete cookie */
    .delete(remove);

export {router};
