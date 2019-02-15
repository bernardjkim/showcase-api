const elasticsearch = require('elasticsearch');
const config = require('../../config/config');

// Core ES variables for this project
const index = 'articles';
const type = 'doc';
const client = new elasticsearch.Client({ host: config.es });

/** Check the ES connection status */
async function checkConnection() {
  let isConnected = false;
  while (!isConnected) {
    console.log('Connecting to ES'); // eslint-disable-line no-console
    try {
      const health = await client.cluster.health({}); // eslint-disable-line no-await-in-loop
      console.log(health); // eslint-disable-line no-console
      isConnected = true;
    } catch (err) {
      console.log('Connection Failed, Retrying...', err); // eslint-disable-line no-console
    }
  }
}

/** Clear the index, recreate it, and add mappings */
async function resetIndex() {
  const settings = {
    settings: {
      index: {
        analysis: {
          analyzer: {
            tag_analyzer: {
              tokenizer: 'letter',
              filter: ['lowercase'],
              boost: 5,
            },
            description_analyzer: {
              tokenizer: 'letter',
              filter: ['common_words', 'unique'],
            },
          },
          normalizer: {
            title_normalizer: {
              type: 'custom',
              filter: 'lowercase',
              boost: 5,
            },
          },
          filter: {
            common_words: {
              type: 'stop',
              ignore_case: true,
              stopwords: '_english_',
            },
          },
        },
      },
    },
  };

  if (await client.indices.exists({ index })) {
    await client.indices.delete({ index });
  }
  await client.indices.create({ index, body: settings });
  await putArticleMapping();
}

/** Add book section schema mapping to ES */
async function putArticleMapping() {
  const schema = {
    mid: { type: 'keyword' },
    title: { type: 'keyword', normalizer: 'title_normalizer' },
    uri: { type: 'keyword' },
    github: { type: 'keyword' },
    image: { type: 'keyword' },
    description: { type: 'text', analyzer: 'description_analyzer' },
    tags: { type: 'text', analyzer: 'tag_analyzer' },

    updated: { type: 'date' },
  };

  return client.indices.putMapping({
    index,
    type,
    body: { properties: schema },
  });
}

module.exports = {
  client,
  index,
  type,
  checkConnection,
  resetIndex,
};
