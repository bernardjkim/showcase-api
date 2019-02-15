const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('showcase-api:index');

// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const { host, port, db } = config.mongo;
const mongoUri = `mongodb://${host}:${port}/${db}`;
const mongoOptions = { useNewUrlParser: true, useCreateIndex: true };
mongoose.connect(mongoUri, mongoOptions);
mongoose.connection.on('error', () => {
  // throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

module.exports = app;