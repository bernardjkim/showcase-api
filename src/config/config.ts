import {config as envConfig} from 'dotenv';
import * as Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
envConfig();

// define validation for all the env vars
const envVarsSchema =
    Joi.object({
         NODE_ENV:
             Joi.string()
                 .allow(['development', 'production', 'test', 'provision'])
                 .default('development'),
         PORT: Joi.number().default(8080),
         JWT_SECRET:
             Joi.string().required().description('JWT_SECRET required to sign'),
         COOKIE_PARSER_SECRET: Joi.string().required().description(
             'COOKIE_PARSER_SECRET required to sign'),
         RABBIT_HOST:
             Joi.string().required().description('RABBIT_HOST required'),
         RABBIT_PORT:
             Joi.number().required().description('RABBIT_PORT required'),
       })
        .unknown()
        .required();

let config: Config = {
  env: '',
  port: '',
  jwtSecret: '',
  cookieSecret: '',
  rabbit: {
    host: '',
    port: '',
  },
};

Joi.validate(process.env, envVarsSchema, (err, value) => {
  if (err) throw new Error(`Config validation error: ${err.message}`);

  config = {
    env: value.NODE_ENV || '',
    port: value.PORT || '',
    jwtSecret: value.JWT_SECRET || '',
    cookieSecret: value.COOKIE_PARSER_SECRET || '',
    rabbit: {
      host: value.RABBIT_HOST || '',
      port: value.RABBIT_PORT || '',
    },
  };
});

interface Config {
  env: string;
  port: string;
  jwtSecret: string;
  cookieSecret: string;
  rabbit: {host: string; port: string;};
}

export = config;
