import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { paramValidation } from '../config/param-validation';
import { validate } from '../util/joi';
import { checkError } from '../util/mq';

import { exchange } from './amqp';

const DB_REQ = 'db.req';
const ES_REQ = 'es.req';

// =============================================================================
//  USER
// =============================================================================

// Define the User type
const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    updated: { type: GraphQLString },
  }),
});

const userInput = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: () => ({
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    passwordConfirm: { type: GraphQLString },
  }),
});

const queryUser = {
  type: userType,
  args: {
    id: { type: GraphQLString },
  },
  async resolve(_: any, { id }: any) {
    const query = { _id: id };
    const result = exchange
      .rpc(query, `${DB_REQ}.user.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

const createUser = {
  type: userType,
  args: {
    input: { type: userInput },
  },
  async resolve(_: any, { input }: any) {
    validate(paramValidation.createUser)(input);
    const { username, email, password } = input;

    const user = { username, email, password };

    const result = exchange
      .rpc(user, `${DB_REQ}.user.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

// =============================================================================
//  ARTICLE
// =============================================================================

const articleType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Article',
  fields: () => ({
    title: { type: GraphQLString },
    uri: { type: GraphQLString },
    github: { type: GraphQLString },
    image: { type: GraphQLString },
    description: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    user: {
      type: userType,
      resolve: (parent, args) => {
        // return _find(users, { id: parent.user });
      },
    },
    likes: {
      type: new GraphQLList(likeType),
      resolve: (parent, args) => {},
    },
    comments: { type: new GraphQLList(commentType), resolve: (parent, args) => {} },
    updated: { type: GraphQLString },
  }),
});

const articleInput = new GraphQLInputObjectType({
  name: 'ArticleInput',
  fields: () => ({
    title: { type: GraphQLString },
    uri: { type: GraphQLString },
    github: { type: GraphQLString },
    image: { type: GraphQLString },
    description: { type: GraphQLString },
    user: { type: userInput },
    tags: { type: new GraphQLList(GraphQLString) },
  }),
});

const articleSearchInput = new GraphQLInputObjectType({
  name: 'ArticleSearchInput',
  fields: () => ({
    terms: { type: new GraphQLList(GraphQLString) },
    user: { type: userInput },
    offset: { type: GraphQLInt },
    sort: { type: GraphQLString },
  }),
});

const queryArticle = {
  type: articleType,
  args: {
    id: { type: GraphQLString },
  },
  resolve: async (_: any, { id }: any) => {
    const query = { _id: id };
    const result = exchange
      .rpc(query, `${DB_REQ}.article.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

const createArticle = {
  type: articleType,
  args: { input: { type: articleInput } },
  resolve: async (_: any, { input }: any) => {},
};

const articleSearch = {
  type: new GraphQLList(articleType),
  args: { input: { type: articleSearchInput } },
  resolve: async (_: any, { input }: any) => {
    const result = exchange
      .rpc(input, `${ES_REQ}.article.search`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => parse(content.docs))
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

/**
 * Parse elasticsearch result
 */
function parse(docs: { hits: { hits: any } }) {
  const arr = docs.hits.hits;
  const results = arr.map((hit: { _id: any; _source: any }) => ({
    id: hit._id,
    ...hit._source,
  }));
  return results;
}

// =============================================================================
//  COMMENT
// =============================================================================

const commentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    user: { type: userType },
    article: { type: articleType },
    value: { type: GraphQLString },
    updated: { type: GraphQLString },
  }),
});

const commentInput = new GraphQLInputObjectType({
  name: 'CommentInput',
  fields: () => ({
    user: { type: userInput },
    article: { type: articleInput },
    value: { type: GraphQLString },
  }),
});

const commentSearchInput = new GraphQLInputObjectType({
  name: 'CommentSearchInput',
  fields: () => ({
    article: { type: articleInput },
    user: { type: userInput },
    offset: { type: GraphQLInt },
    sort: { type: GraphQLString },
  }),
});

const queryComment = {
  type: commentType,
  args: { id: { type: GraphQLID } },
  resolve: async (_: any, { id }: any) => {
    const query = { _id: id };
    const result = exchange
      .rpc(query, `${DB_REQ}.article.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

const createComment = {
  type: commentType,
  args: { input: { type: commentInput } },
  resolve: async (_: any, { input }: any) => {
    const result = exchange
      .rpc(input, `${DB_REQ}.comment.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

const commentSearch = {
  type: new GraphQLList(commentType),
  args: { input: { type: commentSearchInput } },
  resolve: async (_: any, { input }: any) => {
    const results = exchange
      .rpc(input, `${DB_REQ}.comment.list`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        console.log(content.docs);
        return content.docs;
      })
      .catch(err => {
        throw new Error(err);
      });
    return await results;
  },
};

// =============================================================================
//  LIKE
// =============================================================================

const likeType = new GraphQLObjectType({
  name: 'Like',
  fields: () => ({
    user: { type: userType },
    article: {
      type: articleType,
      resolve: (parent, args) => {},
    },
    value: { type: GraphQLBoolean },
    updated: { type: GraphQLString },
  }),
});

const likeInput = new GraphQLInputObjectType({
  name: 'LikeInput',
  fields: () => ({
    user: { type: userInput },
    article: { type: articleInput },
    value: { type: GraphQLBoolean },
  }),
});

const likeSearchInput = new GraphQLInputObjectType({
  name: 'LikeSearchInput',
  fields: () => ({
    user: { type: userInput },
    article: { type: articleInput },
  }),
});

const queryLike = {
  type: likeType,
  args: { id: { type: GraphQLID } },
  resolve: async (_: any, { id }: any) => {
    const query = { _id: id };
    const result = exchange
      .rpc(query, `${DB_REQ}.like.get`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });

    return await result;
  },
};

const createLike = {
  type: likeType,
  args: { input: { type: likeInput } },
  resolve: async (_: any, { input }: any) => {
    const result = exchange
      .rpc(input, `${DB_REQ}.like.create`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        const { _id, ...rest } = content.doc;
        return { id: _id, ...rest };
      })
      .catch(err => {
        throw new Error(err);
      });
    return await result;
  },
};

const likeSearch = {
  type: new GraphQLList(likeType),
  args: { input: { type: likeSearchInput } },
  resolve: async (_: any, { input }: any) => {
    const results = exchange
      .rpc(input, `${DB_REQ}.like.list`)
      .then(msg => msg.getContent())
      .then(checkError)
      .then(content => {
        console.log(content.docs);
        return content.docs;
      })
      .catch(err => {
        throw new Error(err);
      });

    return await results;
  },
};

// =============================================================================
//  QUERY
// =============================================================================

// Define the Query type
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    /* USER */
    user: queryUser,

    /* ARTICLE */
    article: queryArticle,
    articleSearch,

    /* COMMENT */
    comment: queryComment,
    commentSearch,

    /* LIKE */
    like: queryLike,
    likeSearch,
  },
});

// =============================================================================
//  MUTATION
// =============================================================================
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    /* USER */
    createUser,

    /* ARTICLE */
    createArticle,

    /* COMMENT */
    createComment,

    /* LIKE */
    createLike,
  },
});

export const schema = new GraphQLSchema({ query: queryType, mutation: mutationType });
