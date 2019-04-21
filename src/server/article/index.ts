import {Router} from 'express';
import * as multer from 'multer';
import {authenticate, parse as authParse} from '../auth/controller';
import {cacheMiddleware} from '../cache';
import {all, create, get, load, parse, search} from './controller';

// import paramValidation from '../../config/param-validation';
// import { validate } from '../joi';

const router = Router();  // eslint-disable-line new-cap

router
    .route('/')
    /** GET /api/article - Get list of articles */
    .get(all)

    /** POST /api/article - Create new article */
    .post(authParse, authenticate, multer().single('file'), parse, create);

router
    .route('/all')

    /** GET /api/article/all - Get list of articles  */
    .get(all);

router
    .route('/search')

    /** GET /api/article/search?q={search string} - Get list of articles */
    .get(search);

router
    .route('/:article')

    /** GET /api/article/:id - Get article */
    .get(get);

// =============================================================================
router.route('/cache/all').get(cacheMiddleware(10), all);
router.route('/cache/search').get(cacheMiddleware(10), search);
router.route('/cache/:article').get(cacheMiddleware(10), get);
// =============================================================================

/** Load article when API with id route parameter is hit */
router.param('article', load);

export {router};
