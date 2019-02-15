const mongoose = require('mongoose');

const config = require('../../config/config');
const esConnection = require('./connection');

/** Connect to mongoDB */
const mongoUri = config.mongo.host;
const mongoOptions = { keepAlive: 1, useNewUrlParser: true };
mongoose.connect(
  mongoUri,
  mongoOptions,
);
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

const Article = require('../../route/article/article.model');

/** Clear ES index, parse and index all files from the books directory */
async function insertArticles() {
  try {
    // Clear previous ES index
    await esConnection.resetIndex();
    const articles = await Article.find({}).lean();
    await insertArticleData(articles);
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}

/** Bulk index the book data in Elasticsearch */
async function insertArticleData(articles) {
  const promises = [];
  let bulkOps = []; // Array to store bulk operations

  for (let i = 0; i < articles.length; i += 1) {
    // Describe action
    bulkOps.push({
      index: { _index: esConnection.index, _type: esConnection.type },
    });

    // Add document
    const {
      _id,
      title,
      uri,
      github,
      image,
      description,
      tags,
      updated,
    } = articles[i];

    bulkOps.push({
      mid: _id,
      title,
      uri,
      github,
      image,
      description,
      tags,
      updated,
    });

    if (i > 0 && i % 500 === 0) {
      // Do bulk insert in 500 article batches
      promises.push(bulkUpload(bulkOps, `Indexed Articles ${i - 499} - ${i}`));
      bulkOps = [];
    }
  }
  // Insert remainder of bulk ops array
  promises.push(
    bulkUpload(
      bulkOps,
      `Indexed Articles ${articles.length - bulkOps.length / 2} - ${
        articles.length
      }\n\n\n`,
    ),
  );

  Promise.all(promises)
    .then(() => {
      console.log('Load Data Complete'); // eslint-disable-line no-console
      process.exit(0);
    })
    .catch(e => {
      console.error(e); // eslint-disable-line no-console
      process.exit(1);
    });
}

/** Returns a promise that uploads the bulk operations to elasticsearch */
function bulkUpload(bulkOps, msg) {
  return new Promise((resolve, reject) => {
    esConnection.client
      .bulk({ body: bulkOps })
      .then(() => {
        console.log(msg); // eslint-disable-line no-console
        return resolve();
      })
      .catch(e => reject(e));
  });
}
insertArticles();
