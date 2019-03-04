const httpStatus = require('http-status');
const mqClient = require('../../system/amqp');

/**
 * Load user and append to req
 */
async function load(req, res, next, id) {
  const query = { _id: id };
  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'api', 'db.req.user.get')
    .then(reply => {
      const doc = JSON.parse(reply.toString());
      if (doc.error)
        return next(new APIError(doc.error.message), httpStatus.BAD_REQUEST);
      else req.user = doc.user;
      next();
    })
    .catch(next);
}
/**
 * Get user
 * @property  {User}  req.user  - User object
 * @returns   {User}
 */
function get(req, res) {
  return res.json({ user: req.user });
}

/**
 * Create new user
 * @property  {string}  req.body.username - Username
 * @property  {string}  req.body.email    - User email
 * @property  {string}  req.body.password - User password
 *
 */
async function create(req, res, next) {
  const user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  mqClient
    .publish(Buffer, from(JSON.stringify(user)), 'api', 'db.req.user.create')
    .then(reply => {
      const doc = JSON.parse(reply.toString());
      if (doc.error)
        return next(new APIError(doc.error.message), httpStatus.BAD_REQUEST);
      res.status(httpStatus.CREATED).json({ user: doc.user });
    });
}

async function update(req, res, next) {
  const query = {};
  const user = {};
  mqClient
    .publish(
      Buffer.from(JSON.stringify({ query, user })),
      'api',
      'db.req.user.update',
    )
    .then(doc => res.json({ user: JSON.parse(doc.toString()) }))
    .catch(next);
}

async function remove(req, res, next) {
  const query = {};
  mqClient
    .publish(Buffer.from(JSON.stringify(query)), 'api', 'db.req.user.delete')
    .then(doc => res.json({ user: JSON.parse(doc.toString()) }))
    .catch(next);
}

module.exports = { load, get, create, update, remove };
