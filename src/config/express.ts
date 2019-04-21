/* eslint consistent-return:0 import/order:0 */

import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as cookieParser from 'cookie-parser';
// import { methodOverride } = from 'method-override';
import * as cors from 'cors';
import * as express from 'express';
import * as expressWinston from 'express-winston';
import * as helmet from 'helmet';
import * as httpStatus from 'http-status';
import * as logger from 'morgan';
import { router } from '../server';
import { APIError } from '../server/error/APIError';
import * as config from './config';
import { logger as winstonInstance } from './winston';

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
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      // colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }),
  );
}

// mount all routes on /api path
app.use('/api', router);

// if error is not an instanceOf APIError, convert it.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
app.use((err: APIError, req: express.Request, res: express.Response, next: express.NextFunction) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  res.status(err.status).json({
    message: err.isPublic ? err.message : err.status,
    stack: config.env === 'development' ? err.stack : {},
  }),
);

export { app };
