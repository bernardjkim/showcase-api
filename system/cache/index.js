const cache = require('memory-cache');
const SHA256 = require('crypto-js/sha256');
const memCache = new cache.Cache();

// Endpoint when use is not logged in
memCache.put('__express__/api/user/current', {});

// TODO: Only handling 10 reqs at one time? Should be non-blocking while waiting
// for a the cache to update.
const cacheMiddleware = duration => async (req, res, next) => {
  const fields = {};
  // add query values
  for (const key in req.query) {
    fields[key] = req.query[key];
  }

  // add param values
  for (const key in req.params) {
    fields[key] = req.params[key];
  }

  const sorted = {};
  Object.keys(fields)
    .sort()
    .forEach(key => {
      sorted[key] = fields[key];
    });

  const obj = {
    base: req.baseUrl,
    fields: sorted,
  };

  const key = `__express__${SHA256(JSON.stringify(obj))}`;
  let count = 0;
  const lookup = async () =>
    new Promise(resolve => {
      count++;
      const value = memCache.get(key);
      console.log('key: ', key);
      if (value) resolve(value);
      else if (count < 10) setTimeout(async () => lookup().then(resolve), 100);
      else resolve({});
    });

  const value = memCache.get(key);
  if (!value) {
    next();
    lookup().then(content => res.json(content));
  } else {
    res.json(value);
  }
};

module.exports = { memCache, cacheMiddleware };
