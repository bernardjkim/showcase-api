const bluebird = require('bluebird');

const config = require('./config/config');
const app = require('./config/express');

// make bluebird default Promise
Promise = bluebird; // eslint-disable-line no-global-assign

// initialize rabbitmq connection
// amqp.init();

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

module.exports = app;
