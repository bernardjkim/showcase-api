const mongoose = require('mongoose');
const bluebird = require('bluebird');
const util = require('util');
const debug = require('debug')('showcase-api:index');
const config = require('../../config/config');

// mongodb config
const { host, port, db } = config.mongo;
const mongoUri = `mongodb://${host}:${port}/${db}`;
const mongoOptions = { useNewUrlParser: true, useCreateIndex: true };

// plugin bluebird promise in mongoose
mongoose.Promise = bluebird;

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

/**
 * Initialize connection to mongodb server. Will attempt to reconnect every 5
 * seconds if connection failed.
 */
function init() {
  mongoose.connect(mongoUri, mongoOptions);
  mongoose.connection.on('error', err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[MongoDB] unable to connect to ${mongoUri} - retrying in 5 sec`,
      );
      setTimeout(init, 5000);
    }
  });
}

module.exports = { init };
