import { Router, Send } from 'express';
import * as graphqlHTTP from 'express-graphql';

import { router as articleRoutes } from './article';
import { router as authRoutes } from './auth';
import { router as commentRoutes } from './comment';
import { schema } from './graphql';
import { router as likeRoutes } from './like';
import { router as userRoutes } from './user';

const router = Router();

declare global {
  namespace Express {
    interface Request {
      user: { _id: string };
      like: string;
      comment: object;
      comments: object[];
      article: object;
      form: object;
    }
    interface Response {
      sendJSON: Send;
    }
  }
}

/** GET /health-check - Check service health */
router.get('/health-check', (_req, res) => {
  res.send('OK');
});

/** POST /graphql - GraphQL api route */
router.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

router.use('/article', articleRoutes);
router.use('/like', likeRoutes);
router.use('/comment', commentRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

export { router };
