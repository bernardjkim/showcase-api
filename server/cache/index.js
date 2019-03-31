const cache = require('memory-cache');

// configure cache middleware
let memCache = new cache.Cache();

let cacheMiddleware = duration => (req, res, next) => {
  let key = `__express__${req.originalUrl}` || req.url;
  let cacheContent = memCache.get(key);
  if (cacheContent) {
    res.json(cacheContent);
    return;
  } else {
    res.sendJSON = res.json;
    res.json = body => {
      memCache.put(key, body, duration * 1000);
      res.sendJSON(body);
    };
    next();
  }
};

module.exports = cacheMiddleware;
