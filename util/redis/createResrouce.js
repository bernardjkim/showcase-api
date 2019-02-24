const redis = require('./index');

/**
 * Create/update the cached value for the given key
 *
 * @param {string} key  - Resource key
 * @param {string} func - Function to create resource
 */
module.exports = function(key, func) {
  return new Promise(async (resolve, reject) => {
    // acquire lock
    const lock = await redis.redlock
      .lock(`locks:${key}`, redis.ttl)
      .catch(() => {
        // unable to acquire lock
        setTimeout(resolve(null), 200);
        return;
      });
    // not sure why, but lock will return undefined sometimes???
    if (!lock) throw new Error('Redis lock is undefined!!!');

    // delete old value
    await redis.delAsync(key).catch(e => {
      reject(e);
      return;
    });

    // create resource
    const result = await func().catch(e => {
      reject(e);
      return;
    });

    // update cache with resource
    await redis.setAsync(key, JSON.stringify(result)).catch(e => {
      reject(e);
      return;
    });

    // release lock
    lock.unlock().catch(e => {
      // we weren't able to reach redis; your lock will eventually
      // expire, but you probably want to log this error
      console.error('unable to unlock: ', e); //eslint-disable-line no-console
    });
    resolve(result);
  });
};
