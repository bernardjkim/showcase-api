const { client, index, type } = require('./connection');

module.exports = {
  /** Query ES index for the provided term */
  queryTerm(term, offset = 0) {
    const body = {
      from: offset,
      query: {
        multi_match: {
          query: term,
          fields: ['title', 'description', 'tags'],
          fuzziness: 'auto',
        },
      },
      highlight: { fields: { tags: {} } },
    };

    return client.search({ index, type, body });
  },

  /** Query ES index for all */
  queryAll(offset = 0) {
    const body = {
      from: offset,
      query: {
        match_all: {},
      },
    };

    return client.search({ index, type, body });
  },
};
