const cache = require('memory-cache');
const memCache = new cache.Cache();

// configure cache middleware
let cacheMiddleware = duration => (req, res, next) => {
  let key = `__express__${req.originalUrl}` || req.url;
  let cacheContent = memCache.get(key);
  if (cacheContent) {
    // cache hit
    res.send(cacheContent);
    return;
  } else {
    // cache miss
    res.sendResponse = res.send;
    res.send = body => {
      memCache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};

module.exports = cacheMiddleware;
