const Joi = require('joi');

module.exports = {
  // POST /api/auth
  createAuth: {
    body: {
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string().required(),
    },
  },

  // POST /api/user
  createUser: {
    body: {
      username: Joi.string()
        .regex(/^[a-zA-Z0-9]{1,30}$/)
        .required(),
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{6,30}$/)
        .required(),
      passwordConfirm: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .options({
          language: {
            any: {
              allowOnly: '!!Passwords do not match',
            },
          },
        }),
    },
  },

  // POST /api/article
  createArticle: {
    body: {
      title: Joi.string().required(),
      uri: Joi.string()
        .uri()
        .trim()
        .required(),
      description: Joi.string().required(),
    },
    file: Joi.any().required(),
  },
};
