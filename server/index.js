const express = require('express');
const graphqlHTTP = require('express-graphql');
const articleRoutes = require('./article');
const likeRoutes = require('./like');
const commentRoutes = require('./comment');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const { schema } = require('./graphql');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
  res.send('OK');
});

/** POST /graphql - GraphQL api route */
router.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
);

router.use('/article', articleRoutes);
router.use('/like', likeRoutes);
router.use('/comment', commentRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;
