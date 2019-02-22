const redis = require('redis');
const Redlock = require('redlock');
const { promisify } = require('util');
const client = redis.createClient(process.env.REDIS_URL);

const redlock = new Redlock([client], {
  // the expected clock drift; for more details
  // see http://redis.io/topics/distlock
  driftFactor: 0.01, // time in ms

  // the max number of times Redlock will attempt
  // to lock a resource before erroring
  retryCount: 10,

  // the time in ms between attempts
  retryDelay: 200, // time in ms

  // the max time in ms randomly added to retries
  // to improve performance under high contention
  // see https://www.awsarchitectureblog.com/2015/03/backoff.html
  retryJitter: 200, // time in ms
});

// the maximum amount of time you want the resource locked in milliseconds,
// keeping in mind that you can extend the lock up until
// the point when it expires
var ttl = 1000;

module.exports = {
  ...client,
  redlock,
  ttl,
  getAsync: promisify(client.get).bind(client),
  setAsync: promisify(client.set).bind(client),
  keysAsync: promisify(client.keys).bind(client),
};
