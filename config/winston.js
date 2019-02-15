const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const customFormat = winston.format.printf(
  i => `${i.level.toUpperCase()}: ${i.timestamp} ${i.message}`,
);

// Log unhandled exceptions to separate file
const exceptionHandlers = [
  new DailyRotateFile({
    name: 'Error Logs',
    filename: 'logs/errlogs/exceptions-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '128m',
    maxFiles: '14d',
  }),
];

const infoAndWarnFilter = winston.format(info =>
  info.level === 'info' || info.level === 'warn' ? info : false,
);

const errorFilter = winston.format(info =>
  info.level === 'error' ? info : false,
);

// Separate warn/error
const transports = [
  new DailyRotateFile({
    name: 'Error Logs',
    filename: 'logs/errlogs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '128m',
    maxFiles: '14d',
    level: 'warn',
    json: true,
    colorize: false,
    format: winston.format.combine(
      errorFilter(),
      winston.format.timestamp(),
      customFormat,
    ),
  }),
  new DailyRotateFile({
    name: 'INFO logs',
    filename: 'logs/infologs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '128m',
    maxFiles: '14d',
    json: true,
    colorize: false,
    level: 'info',
    format: winston.format.combine(
      infoAndWarnFilter(),
      winston.format.timestamp(),
      customFormat,
    ),
  }),
  new winston.transports.Console({
    level: 'warn', // log warn level to console only
    handleExceptions: true,
    json: false,
    colorize: true,
    format: winston.format.combine(
      winston.format.colorize(),
      // winston.format.simple(),
      winston.format.prettyPrint(),
    ),
  }),
];

const logger = winston.createLogger({
  transports,
  exceptionHandlers,
  level: 'info',
  exitOnError: false,
  // Default format
  format: winston.format.combine(winston.format.timestamp(), customFormat),
});

module.exports = logger;
