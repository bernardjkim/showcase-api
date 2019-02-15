const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number().default(8080),
  MONGOOSE_DEBUG: Joi.boolean().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT_SECRET required to sign'),
  COOKIE_PARSER_SECRET: Joi.string()
    .required()
    .description('COOKIE_PARSER_SECRET required to sign'),
  MONGO_HOST: Joi.string()
    .required()
    .description('MONGO_HOST required'),
  MONGO_PORT: Joi.number().default(27017),
  MONGO_DB: Joi.string()
    .required()
    .description('MONGO_DB required'),
  AWS_ACCESS_KEY_ID: Joi.string()
    .required()
    .description('AWS_ACCESS_KEY_ID required'),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required()
    .description('AWS_SECRET_KEY_ID required'),
  S3_BUCKET: Joi.string()
    .required()
    .description('S3_BUCKET required'),
  ES_HOST: Joi.string()
    .required()
    .description('ES_HOST required'),
  ES_PORT: Joi.number()
    .required()
    .description('ES_PORT required'),
})
  .unknown()
  .required();

// const { err, value: envVars } = await Joi.validate(process.env, envVarsSchema);
Joi.validate(process.env, envVarsSchema, (err, value) => {
  if (err) throw new Error(`Config validation error: ${err.message}`);
  const config = {
    env: value.NODE_ENV,
    port: value.PORT,
    mongooseDebug: value.MONGOOSE_DEBUG,
    jwtSecret: value.JWT_SECRET,
    mongo: {
      host: value.MONGO_HOST,
      port: value.MONGO_PORT,
      db: value.MONGO_DB,
    },
    aws: {
      id: value.AWS_ACCESS_KEY_ID,
      key: value.AWS_SECRET_ACCESS_KEY,
      bucket: value.S3_BUCKET,
    },
    cookieSecret: value.COOKIE_PARSER_SECRET,
    es: {
      host: value.ES_HOST,
      port: value.ES_PORT,
    },
  };
  module.exports = config;
});