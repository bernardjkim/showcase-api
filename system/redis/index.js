const redis = require('../../util/redis');

async function redisMiddleware(req, res, next) {
  let key = `__express__${req.originalUrl}` || req.url;

  // read cached data
  const data = await redis.getAsync(key);

  if (data) {
    // cache hit
    res.json(JSON.parse(data));
  } else {
    // cache miss
    res.jsonResponse = res.json;
    res.json = async body => {
      await redis.setAsync(key, JSON.stringify(body), 'EX', 30);
      res.jsonResponse(body);
    };
    next();
  }
}

module.exports = { redisMiddleware };
