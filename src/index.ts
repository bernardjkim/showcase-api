// import * as bluebird from 'bluebird';

import * as config from './config/config';
import { app } from './config/express';

// make bluebird default Promise
// Promise = bluebird; // eslint-disable-line no-global-assign

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app
    .listen(config.port, () => {
      console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
    })
    .setTimeout(10000);
}

module.exports = app;
