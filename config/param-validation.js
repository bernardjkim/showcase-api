const Joi = require('joi');

module.exports = {
  // POST /api/auth
  createAuth: Joi.object({
    body: Joi.object({
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string().required(),
    }),
  }),

  // POST /api/user
  createUser: Joi.object({
    body: Joi.object({
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
    }),
  }),

  createArticle: Joi.object({
    form: Joi.object({
      title: Joi.string().required(),
      uri: Joi.string()
        .trim()
        .required(),
      github: Joi.string().allow(''),
      description: Joi.string().required(),
      tags: Joi.array(),
    }).required(),
    file: Joi.object({
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
    }).required(),
  }),
};
