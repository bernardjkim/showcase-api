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
    form: {
      title: Joi.string().required(),
      uri: Joi.string()
        .trim()
        .required(),
      github: Joi.string(),
      description: Joi.string().required(),
      tags: Joi.array(),
    },
    file: {
      fieldname: Joi.string()
        .valid('file')
        .required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      // TODO: only allow certain set of file types?
      mimetype: Joi.string()
        .valid('image/png')
        .required()
        .error(new Error("File must be of type 'image/png'")),
      buffer: Joi.any().required(),
      size: Joi.number().required(), // TODO: limit file size?
    },
  },
};
