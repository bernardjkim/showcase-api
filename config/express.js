/* eslint consistent-return:0 import/order:0 */

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
// const methodOverride = require('method-override');
const cors = require('cors');
const httpStatus = require('http-status');
const expressWinston = require('express-winston');
const helmet = require('helmet');
const winstonInstance = require('./winston');
const routes = require('../server');
const config = require('./config');
const APIError = require('../server/error/APIError');

const isDev = process.env.NODE_ENV !== 'production';
const app = express();

if (isDev) app.use(logger('dev'));

// parsing application/json
app.use(bodyParser.json());
// parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// compress response bodies
app.use(compress());

// lets you use HTTP verbs such  in places where the client doesn't support it.
// app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// parse cookies
app.use(cookieParser(config.cookieSecret));

// enable CORS - Cross Origin Resource Sharing
app.use(cors({ credentials: true }));

// enable detailed API logging in dev env
if (isDev) {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      winstonInstance,
      meta: true, // optional: log meta data about request (defaults to true)
      msg:
        'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }),
  );
}

// mount all routes on /api path
app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  // TODO: handle joi validation errors
  // if (err instanceof expressValidation.ValidationError) {
  //   // validation error contains errors which is an array of error each containing message[]
  //   const unifiedErrorMessage = err.errors
  //     .map(error => error.messages.join('. '))
  //     .join(' and ');
  //   const error = new APIError(unifiedErrorMessage, err.status, true);
  //   return next(error);
  // }
  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND);
  return next(err);
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(
    expressWinston.errorLogger({
      winstonInstance,
    }),
  );
}

// error handler, send stacktrace only during development
app.use((
  err,
  req,
  res,
  next, // eslint-disable-line no-unused-vars
) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {},
  }),
);

module.exports = app;
